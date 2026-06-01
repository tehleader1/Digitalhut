# FireCuda DigitalHut Operations

The FireCuda is the local business backbone for DigitalHut. It should hold the repo, builds, audit logs, snapshots, observatory assets, GLB cache, marketplace exports, and mobile handoffs.

## Full Cycle

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Pull -Install -Build -Audit -Start
```

## Audit Only

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Audit
```

## Start Local Server

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Start
```

## Breathing Space Created

The runner creates these folders on FireCuda:

```text
DigitalHut/builds
DigitalHut/audit-logs
DigitalHut/screenshots
DigitalHut/observatory-assets
DigitalHut/glb-cache
DigitalHut/marketplace-exports
DigitalHut/mobile-handoffs
DigitalHut/server-snapshots
```

## Runtime Loop

```text
FireCuda local repo
-> pull code
-> install/build
-> audit production endpoints
-> save snapshots
-> start local server
-> package hourly update
-> push clean changes
-> deploy
-> verify
-> archive back to FireCuda
```
