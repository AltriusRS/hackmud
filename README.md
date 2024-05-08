# HackMUD Scripts

Hi folks, this is a collection of my hackmud scripts which I have been writing whilst going along and trying to find useful tools

If you found this repository, chances are you came looking for `find.r`, the source code can be found under the `src` folder in the appropriately named folder

## find.r {find.r}

A powerful search engine for hackmud, it can be used to find any script that is publicly available in the mud, and will return all known information about the script.

### Usage  {find.r.usage}

`find.r { <arguments> }` - [See the source!](./find/r.ts)

#### Arguments {find.r.usage.arguments}

| Parameter   |   Type    | Required | Usage                    | Description                                                            |
|:------------|:---------:|:--------:|:-------------------------|:-----------------------------------------------------------------------|
| `showStale` | `boolean` |    No    | `showStale: true`        | Shows all scripts which have not been scanned in the previous 12 hours |
| `name`      | `string`  |    No    | `name: "some.script"`    | Searches for a script with the given name                              |
| `level`     | `string`  |    No    | `level: "fullsec"`       | Searches for scripts with the given level                              |
| `sector`    | `string`  |    No    | `sector: "CHAOS_ZETA_3"` | Searches for scripts with the given sector                             |
| `publics`   | `boolean` |    No    | `publics: true`          | Shows only scripts which end in `.public`                              |
| `prefix`    | `string`  |    No    | `prefix: "wiz."`         | Searches for scripts with the given prefix                             |
| `postfix`   | `string`  |    No    | `postfix: ".bank"`       | Searches for scripts with the given postfix                            |
| `regex`     | `string`  |    No    | `regex: "[0-9]"`         | Searches for scripts with the given regex                              |
| `user`      | `string`  |    No    | `user: "username"`       | Searches for scripts created by the given user                         |

### Macros {find.r.macros}

Below are some macros which can be copy pasted into the terminal to make your life easier!

```js
// Get the details of a specific script
/details = find.r {{ name:"{$}" }}

// Search for a script with a given prefix
/prefix  = find.r {{ prefix:"{$}" }}

// Search for a script with a given postfix
/postfix = find.r {{ postfix:"{$}" }}

// Search for a script with a given regex
/regex   = find.r {{ regex:"{$}" }}

// Search for a script with a given level
/level   = find.r {{ level:"{$}" }}

// Report a script that has scammed you
/report  = find.r {{ report:"{$}" }}

// Search for scripts created by a given user 
/user    = find.r {{ user: "{$}" }}

// Show only scripts which end in .public
/publics = find.r {{publics:true, level: "{$}"}}
```

---

## find.donate {find.donate}

A script which allows you to donate to me, supporting the project and helping me keep it going!

### Usage {find.donate.usage}

`find.donate { <arguments> }` - [See the source!](./find/donate.ts)

#### Arguments {find.donate.usage.arguments}

| Parameter |   Type   | Required | Usage              | Description                    |
|:----------|:--------:|:--------:|:-------------------|:-------------------------------|
| `donate`  | `number` |    No    | `donate: <amount>` | Donates the given amount to me |

### Macros {find.donate.macros}

Below are some macros which can be copy pasted into the terminal to make your life easier!

```js
// Donate to me
/donate = find.donate {{ donate:<amount> }}
```
