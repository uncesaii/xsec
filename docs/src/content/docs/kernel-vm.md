---
title: Kernel VM Verification
description: Build and configure the QEMU guest used by x ingest --verify.
---

`x ingest --verify` runs C reproducers inside a local QEMU guest and compares
the guest `dmesg` against the imported kernel crash report. Without the VM,
kernel verification stays static-only — XSEC won't claim a crash was reproduced.

## What the repo provides

A maintained build recipe at `packages/core/src/triage/kernel-vm/` builds:

- `bzImage` — Linux 6.8.12 for x86_64 with KASAN, UBSAN, KCSAN, lock debugging,
  RCU stall detection, and virtio/9p/ext4/NFS/Bluetooth/WiFi/SCTP support.
- `rootfs.img` — 512 MB Debian Bookworm ext4 with `gcc`, `binutils`, `make`,
  `procps`, `kmod`, `strace`, `gdb`, OpenSSH, and `/sbin/xsec-init`.
- `kernel.config` — the exact config used for the build.
- `xsec_vm_key[.pub]` — root SSH keypair for manual debugging only (the verifier
  uses a QEMU 9p share, not SSH).

Prebuilt artifacts are not committed. Build locally or let the GitHub Actions
E2E workflow build and cache them.

## Requirements

- Docker (reproducible guest build)
- QEMU (`qemu-system-x86_64`)
- ~20 GB free disk for the build cache
- Enough guest memory (default 2048 MB)
- Optional KVM acceleration on Linux; macOS/CI run without it, but may need
  higher boot/reproducer timeouts.

## Build recipe

From the repo root:

```bash
pnpm install --frozen-lockfile

cd packages/core/src/triage/kernel-vm
env XSEC_KERNEL_VM_MAKE_JOBS=4 \
  ./build.sh "$HOME/.xsec/kernel-vm/linux-6.8.12-kasan"
```

Output:

```text
$HOME/.xsec/kernel-vm/linux-6.8.12-kasan/
  bzImage
  rootfs.img
  kernel.config
  xsec_vm_key
  xsec_vm_key.pub
```

Treat the output directory as a local cache; regenerate it when the Dockerfile,
kernel version, or guest package list changes.

## Configure XSEC

Required values must be passed with `env`: `XSEC_*` names begin with a digit and
cannot be exported by POSIX shells.

```bash
env \
  XSEC_KERNEL_QEMU=1 \
  XSEC_KERNEL_QEMU_KERNEL="$HOME/.xsec/kernel-vm/linux-6.8.12-kasan/bzImage" \
  XSEC_KERNEL_QEMU_DISK="$HOME/.xsec/kernel-vm/linux-6.8.12-kasan/rootfs.img" \
  x ingest --verify ./crashes
```

Recommended local defaults can be added to the same command:

```bash
env \
  XSEC_KERNEL_QEMU=1 \
  XSEC_KERNEL_QEMU_KERNEL="$HOME/.xsec/kernel-vm/linux-6.8.12-kasan/bzImage" \
  XSEC_KERNEL_QEMU_DISK="$HOME/.xsec/kernel-vm/linux-6.8.12-kasan/rootfs.img" \
  XSEC_KERNEL_QEMU_MEMORY_MB=2048 \
  XSEC_KERNEL_QEMU_SMP=2 \
  XSEC_KERNEL_QEMU_BOOT_TIMEOUT_SEC=180 \
  XSEC_KERNEL_QEMU_TIMEOUT_SEC=60 \
  XSEC_KERNEL_QEMU_ARTIFACT_DIR="$HOME/.xsec/kernel-vm/runs" \
  x ingest --verify ./crashes
```

On Linux hosts with KVM, add `XSEC_KERNEL_QEMU_ACCEL=kvm` to that `env` invocation.

Leave `XSEC_KERNEL_QEMU_APPEND` unset unless using a custom guest. Default:

```text
console=ttyS0 root=/dev/vda rw nokaslr panic=-1 init=/sbin/xsec-init
```

## Run verification

Place crash reports and reproducers in one directory; file stems are matched:

```text
crashes/
  bug-001.log
  bug-001.c
  bug-002.report
  bug-002.syz
```

```bash
x ingest ./crashes --verify --output json
```

For each C reproducer XSEC writes `repro.c` and `runner.sh` to a temp dir, boots
QEMU with a 9p share (`xsecshare`), lets `/sbin/xsec-init` run
`/mnt/xsec/runner.sh`, compiles and runs the reproducer under the timeout, and
copies `compile.log`, `run.log`, `dmesg.log`, markers, and the serial log back
to the artifact directory (when configured).

### Privilege and provenance

The guest runs reproducers as UID 0 by default, so it can prove repeatable crash
behavior but not unprivileged reachability — such evidence is marked privileged.
Zero-cap certification uses a trusted launcher that drops all IDs, groups, and
capabilities, sets `no_new_privs`, and binds a hashed receipt to a nonce and the
reproducer digest; missing or inconsistent evidence falls back to privileged.

Schema-v2 receipts also bind a staged copy of the `bzImage`, its config SHA-256,
and the expected kernel release; QEMU boots the staged image and the host
re-hashes it before and after. The guest supplies its runtime release
(`/proc/sys/kernel/osrelease`) and boot UUID; a release mismatch, malformed or
repeated UUID, or staged-image change invalidates the gate. This catches
ordinary label/artifact mixups but is **not** hardware attestation (no TPM /
SEV-SNP) and does not defend against a malicious host or guest kernel, nor prove
the running kernel config without a runtime measurement like `/proc/config.gz`.

If `XSEC_KERNEL_QEMU_ARTIFACT_DIR` is unset, the temp run directory is deleted
after each attempt.

## Guest contract

A custom guest must satisfy:

| Requirement | Contract |
| --- | --- |
| Architecture | x86_64, bootable by `qemu-system-x86_64` |
| Root device | `root=/dev/vda` (or matching custom append) |
| Init path | `/sbin/xsec-init` (unless `XSEC_KERNEL_QEMU_APPEND` changed) |
| Host share | Mount 9p tag `xsecshare` at `/mnt/xsec` |
| Runner | Execute `/mnt/xsec/runner.sh`, leave results in the share |
| Compiler | `/usr/bin/gcc` plus libc headers and `binutils` |
| Logs | `dmesg` readable after the reproducer runs |
| Kernel | Debug-friendly, crash signal visible in `dmesg` |

SSH is not part of the contract; the keypair is only for manual debugging.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `XSEC_KERNEL_QEMU` | Yes | - | `1` to enable VM execution |
| `XSEC_KERNEL_QEMU_KERNEL` | Yes | - | Path to `bzImage` |
| `XSEC_KERNEL_QEMU_DISK` | Yes | - | Path to `rootfs.img` or other bootable disk |
| `XSEC_KERNEL_QEMU_CONFIG` | For provenance | - | Config used to build the selected kernel |
| `XSEC_KERNEL_QEMU_EXPECTED_RELEASE` | For prebuilt artifacts | - | Exact expected `uname -r`; never inferred from filename |
| `XSEC_KERNEL_QEMU_BINARY` | No | `qemu-system-x86_64` | QEMU binary |
| `XSEC_KERNEL_QEMU_DISK_FORMAT` | No | inferred | `raw` or `qcow2` |
| `XSEC_KERNEL_QEMU_MEMORY_MB` | No | `2048` | Guest memory (MB) |
| `XSEC_KERNEL_QEMU_SMP` | No | `2` | Guest CPU count |
| `XSEC_KERNEL_QEMU_APPEND` | No | see above | Kernel command line |
| `XSEC_KERNEL_QEMU_ACCEL` | No | - | Accelerator, e.g. `kvm` |
| `XSEC_KERNEL_QEMU_INITRD` | No | - | Optional initrd for custom guests |
| `XSEC_KERNEL_QEMU_BOOT_TIMEOUT_SEC` | No | `120` | Boot + setup time |
| `XSEC_KERNEL_QEMU_TIMEOUT_SEC` | No | `60` | Reproducer time |
| `XSEC_KERNEL_QEMU_SHARE_TAG` | No | `xsecshare` | 9p mount tag |
| `XSEC_KERNEL_QEMU_ARTIFACT_DIR` | No | - | Where per-run artifacts are preserved |

## Troubleshooting

If the VM exits early, inspect `serial.log` in `XSEC_KERNEL_QEMU_ARTIFACT_DIR`.
Common causes:

- The guest didn't mount the 9p share (keep `XSEC_KERNEL_QEMU_SHARE_TAG` and
  `/sbin/xsec-init` in sync).
- Missing `gcc` or libc headers in a custom guest.
- `dmesg` unreadable, or boot timeout too low without KVM.
- Custom append line no longer points at the correct root disk or init.

`.github/workflows/kernel-validator-e2e.yml` is the smoke-tested CI reference: it
builds the artifacts, boots QEMU, runs a real `ingest --verify`, and uploads the
logs.

## Batch validation

Maintainers can run `.github/workflows/kernel-validator-batch.yml` manually to
validate a curated syzbot corpus against the real VM. The default corpus is
`scripts/kernel-validator-batch-corpus.json`; a JSON override is accepted. It
uploads `summary.json` (with `verified`, `reproduced`, `crashMatch`,
`reproducedMismatch`, `staticOnly`, `failed`, `errored` counts), `summary.md`,
per-case `result.json`, raw CLI output, and VM artifacts. It is
`workflow_dispatch` only.
