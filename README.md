# Open Music API

---

## Install Requirements

#### 1. Install on Ubuntu

```bash
./install-ubuntu.sh
source ~/.bashrc
```

#### 2. Install on Debian

```bash
./install-debian.sh
source ~/.bashrc
```

---

## How to Run Program

#### 1. Check `.env.example` for required environment variables.

#### 2. Run on Development

```bash
npm run build:local
```

#### 3. Run on Production (Linux Server Only)

```bash
npm run build:server
```

#### 4. Run on Docker

-   Build Docker Image

```bash
npm run build:docker
```

-   Run Docker Container

```bash
npm run start:docker
```
