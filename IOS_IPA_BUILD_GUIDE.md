# iOS .ipa Build Implementation Guide for GitHub Actions

## Overview

An `.ipa` (iOS App Package) file is the compiled and signed iOS application ready for distribution via the App Store, TestFlight, or ad hoc distribution. This guide walks through setting up a complete GitHub Actions workflow to automatically build .ipa files for your Capacitor-based iOS app.

---

## Prerequisites

Before creating the GitHub Actions workflow, you need:

### 1. **Apple Developer Account & Certificates**
- Active Apple Developer Program membership
- Distribution Certificate (for building release .ipa)
- At least one Signing Certificate (Development or Distribution)
- App ID created in Apple Developer Portal

### 2. **Provisioning Profiles**
- App Store Distribution Profile (for App Store releases)
- Ad Hoc Distribution Profile (for testing)
- These must match your app's bundle identifier

### 3. **Code Signing Credentials Export**
You'll need to export your signing certificates and provisioning profiles:
- Open Keychain Access on your Mac
- Find your distribution certificate
- Right-click and select "Export" 
- Save as `.p12` format with a secure password
- Save the password securely in a password manager

### 4. **Mac Build Machine or GitHub-hosted Runners**
- GitHub Actions provides `macos-latest` runners (currently macOS 14.x or 15.x)
- Includes Xcode, CocoaPods, and required tools pre-installed

---

## GitHub Secrets Setup

Store sensitive credentials as encrypted secrets in your GitHub repository.

**Required Secrets:**

1. **`IOS_CERTIFICATE_P12`**
   - Base64-encoded .p12 certificate file
   - Generate this by encoding your exported certificate in base64 format

2. **`IOS_CERTIFICATE_PASSWORD`**
   - Password for the .p12 certificate

3. **`IOS_PROVISIONING_PROFILE`**
   - Base64-encoded .mobileprovision file
   - Generate this by encoding your provisioning profile in base64 format

4. **`IOS_PROVISIONING_PROFILE_NAME`**
   - Name of your provisioning profile as shown in Apple Developer Portal
   - Example: `App Store Distribution`

5. **`IOS_DEVELOPMENT_TEAM_ID`**
   - Your Apple Development Team ID (10-character alphanumeric)
   - Found in Apple Developer Portal under Team Settings

6. **`IOS_KEYCHAIN_PASSWORD`**
   - A temporary password for the keychain during the build process
   - Can be any secure random string

7. **`IOS_BUNDLE_ID`** (Optional but recommended)
   - Your app's bundle identifier
   - Example: `com.zimasahealth.showcase`

### Adding Secrets to GitHub

1. Navigate to your repository settings
2. Go to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the appropriate value
5. For sensitive values, ensure they're securely generated and never hardcoded

---

## Capacitor-Specific Setup

### Configure Capacitor iOS Platform

Ensure your Capacitor iOS project is properly configured:

- Install Capacitor CLI if not already installed
- Run sync command to copy web assets to the iOS project
- If you need to add or reinitialize the iOS platform, use the appropriate Capacitor command

### Update iOS Project Settings

Edit your iOS project's `Info.plist` file to ensure:
- Bundle identifier matches your provisioning profile exactly
- Version numbers are set correctly for your release

Edit your Xcode project configuration:
- Development Team ID is set correctly
- Code signing settings are configured appropriately for your distribution method

---

## GitHub Actions Workflow Implementation

### Step 1: Create Workflow Directory

Create a `.github/workflows` directory in your repository root if it doesn't exist.

### Step 2: Create the Workflow File

Create a new YAML file in the workflows directory. This file will contain all the steps needed to:
1. Check out your code
2. Set up Node.js and dependencies
3. Build your web assets
4. Sync Capacitor with iOS project
5. Configure code signing certificates
6. Set up provisioning profiles
7. Build the Xcode archive
8. Export the .ipa file
9. Upload artifacts and debug symbols
10. Clean up temporary credentials

### Step 3: Configure Workflow Triggers

Decide when your workflow should run:
- On push to specific branches (main, develop, etc.)
- On pull requests for validation
- Via manual workflow_dispatch trigger for on-demand builds

### Step 4: Adjust for Your Configuration

Modify the workflow based on your setup:

- **Branches**: Change which branches trigger the build
- **Node version**: Match your project's requirements
- **Xcode version**: Verify compatibility with your dependencies
- **Workspace vs Project**: Determine if using `.xcworkspace` or `.xcodeproj`
- **Export method**: Choose the appropriate method for your distribution strategy

---

## Workflow Steps Explained

### Build Web Assets
The workflow starts by building your Next.js web application, which gets embedded in the iOS app via Capacitor.

### Certificate & Keychain Setup
The workflow creates a temporary, isolated keychain on the GitHub Actions runner. Your certificate is imported into this keychain and configured for code signing. The keychain is deleted after the build completes for security.

### Provisioning Profile Installation
Your provisioning profile is decoded from the base64-encoded secret and placed in the expected location on the build machine.

### Archive Creation
The workflow calls xcodebuild to create an archive of your app. This step:
- Compiles all source code
- Links dependencies
- Performs code signing with your certificate
- Creates the .xcarchive bundle

### IPA Export
The archive is exported to an .ipa file using export options that specify:
- Distribution method (App Store, Ad Hoc, Enterprise, or Development)
- Provisioning profile to use
- Code signing certificate
- Team ID

### Artifact Upload
The resulting .ipa file is uploaded as a build artifact so you can download it. dSYM symbols are also uploaded for debugging.

---

## Advanced Configurations

### Version Management

You can automatically update your app version from git tags. The workflow can:
- Read the most recent tag
- Extract version number
- Update your Xcode project settings before building
- Create builds with consistent versioning

### Multiple Build Configurations

Create separate workflows for different scenarios:
- Staging workflow for TestFlight builds
- Production workflow for App Store releases
- Ad Hoc workflow for internal testing

Each workflow can have different export methods, signing profiles, and notification targets.

### Notifications

Add notifications on build success or failure:
- Slack notifications to your team channel
- Email notifications to developers
- GitHub notifications via commit statuses

---

## Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Code signing failure | Verify bundle ID matches provisioning profile exactly |
| Unable to find provisioning profile | Check that profile name matches the secret value |
| Certificate not found | Ensure certificate is properly imported to keychain |
| Keychain timeout | Add unlock keychain step before building |
| Export failed | Verify ExportOptions.plist configuration matches your profile |
| Archive creation failed | Run Capacitor sync command before building, ensure web build completes |
| Secrets not accessible | Confirm secrets are added to the correct repository, not organization level |

### Debugging Strategies

To troubleshoot build failures:

1. **Enable verbose logging** - Add verbose flag to xcodebuild commands
2. **Check provisioning profiles** - List files in the provisioning profiles directory
3. **Verify keychain** - List signing certificates and check partition settings
4. **Review Xcode logs** - Check build logs for detailed error messages
5. **Test web build** - Verify your Next.js build completes successfully
6. **Validate secrets** - Confirm all secrets are base64-encoded correctly

---

## Testing Locally

Before pushing to GitHub, test the build process on your local machine:

1. **Prepare web assets** - Build your Next.js application and sync with Capacitor
2. **Open Xcode** - Open the iOS project workspace
3. **Configure signing** - Set up code signing in Xcode:
   - Select your project
   - Configure the target
   - Set your development team
   - Select your provisioning profile
4. **Build archive** - Use xcodebuild to create an archive
5. **Export IPA** - Export the archive using an ExportOptions plist file
6. **Verify output** - Ensure the .ipa file is created successfully

This local testing validates that your setup works before relying on GitHub Actions.

---

## Security Best Practices

1. **Never commit certificates or profiles** - Always use GitHub Secrets and .gitignore
2. **Rotate certificates regularly** - Update every 12 months or when team members change
3. **Use separate profiles for environments** - Keep Development, Staging, and Production separate
4. **Audit secret access** - Regularly review who has access to repository secrets
5. **Temporary credentials** - The workflow creates temporary keychains that are automatically deleted
6. **Use specific GitHub Actions versions** - Avoid using `@latest` tag for reproducibility and security
7. **Limit branch access** - Only allow production builds from protected branches
8. **Monitor build logs** - Review logs for unexpected access or certificate issues

---

## Performance Optimization

### Dependency Caching

The workflow can cache dependencies between runs to speed up subsequent builds:
- Node.js packages can be cached using npm cache
- CocoaPods dependencies can be cached if your iOS project uses them

### Artifact Management

Consider setting retention policies for your artifacts:
- Keep .ipa files for 30 days for testing
- Keep dSYM files longer for crash reporting
- Clean up old artifacts to save storage space

### Parallel Builds

For more advanced scenarios with multiple targets or variants, you can:
- Use GitHub Actions matrix strategy to build multiple configurations
- Run tests in parallel with your build
- Deploy multiple variants simultaneously

---

## Next Steps

1. **Gather Apple credentials** - Export your distribution certificate and provisioning profile
2. **Prepare secrets** - Base64-encode your credentials and verify they're correct
3. **Add GitHub Secrets** - Add all required secrets to your repository
4. **Create workflow file** - Create the workflow YAML file in `.github/workflows/`
5. **Configure for your setup** - Update bundle ID, profile names, and export method
6. **Test locally first** - Run the build on your machine to verify it works
7. **Initial GitHub run** - Push the workflow or trigger manually to test
8. **Verify output** - Download and test the generated .ipa file
9. **Monitor builds** - Watch workflow runs and debug any issues
10. **Setup distribution** - Configure App Store Connect or TestFlight access for releases

---

## Additional Resources

- **Capacitor iOS Documentation** - Official guide for iOS platform configuration
- **xcodebuild Reference** - Apple's documentation for command-line building
- **GitHub Actions Documentation** - Comprehensive guide for workflow syntax
- **Apple Code Signing Guide** - Apple's official code signing documentation
- **App Store Connect Help** - Managing certificates and provisioning profiles
- **TestFlight Documentation** - For internal and external testing

---

## Key Concepts

### .ipa vs .xcarchive
- An `.xcarchive` is an intermediary archive format containing compiled code and metadata
- An `.ipa` is the final packaged application that can be distributed

### Provisioning Profiles
- Define which devices can run your app
- Specify which signing certificate to use
- Tied to a specific bundle identifier

### Code Signing
- Uses your private key to sign the app
- Verifies the app hasn't been modified
- Required for all app distribution

### Export Options
- Configure how the archive is exported to .ipa
- Specify distribution method (App Store, Ad Hoc, etc.)
- Control whether bitcode is included
