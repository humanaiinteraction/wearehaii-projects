# HAII Apps

This repository contains applications and solutions built during the HAII podcast. Each app represents a real-world problem solved with practical, low-cost solutions.

## About This Repository

All apps in this repository were developed as part of the HAII podcast episodes, where we tackle real problems and build working solutions. These apps are production-ready and can be used as-is or adapted for your own needs.

## Repository Structure

We use a simple folder structure where each app has its own directory:

```
haii_apps/
├── classcount/                      # App from podcast episode(s)
│   ├── README.md                    # App documentation
│   └── google-apps-script/          # Solution implementation
└── [future-apps]/
```

## Version Management with Git Tags

We use **git tags** to mark different versions of each app, making it easy to find the exact version you need:

### Tag Naming Convention

- **Podcast versions**: `[app-name]-vX` (e.g., `classcount-v1`, `classcount-v2`)
  - These tags mark the exact version built during a podcast episode
  - Use sequential version numbers for each podcast episode
- **Spare time improvements**: `[app-name]-full-build` (e.g., `classcount-full-build`)
  - These tags mark enhanced versions worked on outside of podcast episodes with additional features and improvements

### Creating Tags

**Create a tag for the current commit (podcast version):**
```bash
git tag classcount-v1
```

**Create a tag with a message:**
```bash
git tag -a classcount-v1 -m "Version from podcast"
```

**Create a tag for a specific commit:**
```bash
git tag classcount-v1 <commit-hash>
```

**Push tags to remote:**
```bash
git push origin classcount-v1
# Or push all tags at once:
git push origin --tags
```

### Finding and Using Specific Versions

**List all tags for an app:**
```bash
git tag -l "classcount-*"
```

**List all tags:**
```bash
git tag -l
```

**Checkout a specific podcast version:**
```bash
git checkout classcount-v1
```

**Checkout a full build (improved version):**
```bash
git checkout classcount-full-build
```

**Return to the latest version:**
```bash
git checkout main
```

### For Podcast Listeners

If you heard about an app in a podcast episode and want the **exact version** we built during that episode:

1. List available tags: `git tag -l "[app-name]-v*"`
2. Checkout that tag: `git checkout [app-name]-v1` (or v2, v3, etc.)

## Current Apps

### ClassCount
A session tracking solution for managing student subscriptions and sending automated reminders.

- **Podcast Episode**: [Episode number TBD]
- **Status**: Active
- **Solution**: Google Apps Script

See [classcount/README.md](./classcount/README.md) for details.

## Contributing

This repository is primarily for reference and educational purposes. If you'd like to suggest improvements or report issues, please open an issue or submit a pull request.

## License

Unlicensed

---

**Note**: Use git tags to find the exact version of an app from a specific podcast episode (v1, v2, etc.), or checkout the full-build version with improvements we've worked on in our spare time. The main branch always contains the latest stable version.

