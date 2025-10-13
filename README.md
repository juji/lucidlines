# LucidLines

```
!! On active development
```

A CLI utility that pipes the outputs of your paralel tasks to a browser, for better viewing.

> concurently, with browser output.

```bash
npm i -D lucidlines
```

## Initialize

```bash
npx lucidlines init
```

Will create initial config file .lucidlines.json5

```
[
  {
    name: "process 1",
    cmd: "echo 'this is what i need'"
  },
  {
    name: "frontend",
    cmd: "npm run dev",
    workDir: "./frontend"
  },
  {
    name: "backend",
    cmd: "npm run dev",
    workDir: "./backend"
  }
]
```

## Run

```bash
npx lucidlines
```


## 