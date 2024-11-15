# HERA Mobile App

Welcome to the HERA Mobile App repository! HERA is dedicated to connecting refugee communities with essential healthcare services through an open-source mobile health platform. By making our technology freely available, we hope to empower organizations like NGOs and local aid groups to customize and deploy healthcare solutions that meet the specific needs of refugees in their regions.

## Overview

HERA’s mission is to support vulnerable populations, particularly refugees, by increasing access to vital healthcare services. As part of this mission, HERA focuses on preventive healthcare, with an initial goal to improve prenatal care and vaccination rates among refugees. This project began by addressing critical healthcare needs among Syrian refugees in Turkey, and HERA plans to extend support to refugees globally.

Our technology stack includes a React Native mobile app and [Django web backend](https://github.com/Hera-Digital-Health-Open-Source/herabackend) with robust APIs, and an admin panel, all of which can be adapted by organizations to provide tailored healthcare solutions.

## Features
- **Mobile Health Platform**: Connects refugees with available healthcare services.
- **Customizable Solution**: Open-source codebase that NGOs and organizations can adapt to specific regions and needs.
- **Focus on Maternal and Child Health**: Prioritizes prenatal care and childhood vaccinations.
  
## Getting Started

To set up the HERA Mobile App locally, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (version 16.20.2)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install)
- [Android Studio](https://developer.android.com/studio) (for Android development) or [Xcode](https://developer.apple.com/xcode/) (for iOS development)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hera-Digital-Health-Open-Source/heramobileapp.git
   cd hera-mobile-app
   ```

2. **Install dependencies** (we recommend using Yarn):
   ```bash
    yarn install
   ```
> **Note**: If you don’t have Yarn installed, you can enable it using Node.js's `corepack`:

```bash
    corepack enable
```
Alternatively, you can install Yarn with Homebrew:

```bash
    brew install yarn
```
> **Tip**: If you switch to Yarn from NPM, it's best to delete `package-lock.json` to avoid conflicts. Yarn will create its own `yarn.lock` file.

3. Set up the environment variables: Copy the `.env` file into the project root (`heramobileapp`). If you don’t have this file, please ask another developer on the project for access.

## Contributing
We welcome contributions from everyone! Please check out our Contributing Guide for instructions on how to get involved. We also encourage you to read our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a positive experience for all contributors.

## Community & Support
Stay connected with HERA’s community:
- [Facebook](https://www.facebook.com/HeraDigitalHealth)
- [Twitter](https://twitter.com/HERA_dHealth)
- [Instagram](https://www.instagram.com/heradigitalhealth/)
- [YouTube](https://www.youtube.com/channel/UCkQ1ovuIV8qg7lezNgc6w2w)

## License
This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.

## Acknowledgments
Thank you to all the contributors who make HERA possible! Special thanks to the HERA team and community for their dedication to open-source development.
- [Su Yuen](https://github.com/suyuen)
- [Husam](https://github.com/husam79)
