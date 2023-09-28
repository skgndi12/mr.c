# mrc-ui

`Mr.C` 의 UI 프로젝트입니다.
`yarn berry` 의 [`workspaces`](https://yarnpkg.com/features/workspaces) 기능으로 아래의 프로젝트들을 관리합니다.

| name                                                       | description                                    |
| ---------------------------------------------------------- | ---------------------------------------------- |
| [mr-c.app](/packages/mr-c.app/README.md)                   | `Mr.C` 의 메인 서비스 프로젝트                 |
| [common-components](/packages/common-components/README.md) | 공통으로 사용하는 컴포넌트를 담당하는 프로젝트 |
| [common-utils](/packages/common-utils/README.md)           | 공통으로 사용하는 유틸리티를 담당하는 프로젝트 |

## 목차

- [mrc-ui](#mrc-ui)
  - [목차](#목차)
  - [설치하기](#설치하기)
  - [구조](#구조)
  - [스크립트](#스크립트)
    - [개별 프로젝트의 스크립트 실행](#개별-프로젝트의-스크립트-실행)
    - [테스트](#테스트)
  - [프로젝트 설정](#프로젝트-설정)
    - [프로젝트간 참조](#프로젝트간-참조)
    - [프로젝트 추가](#프로젝트-추가)

## 설치하기

1. `yarn` 이 설치되어 있지 않다면 `yarn` 을 설치합니다.
   ```bash
   npm install -g yarn
   ```
   or
   ```bash
   brew install yarn
   ```
2. 의존성을 설치합니다.
   `.yarnrc.yml` 에 정의된 yarn 버전 (`yarn berry`) 으로 설치됩니다.

   ```bash
   yarn install --immutable
   ```

## 구조

`ui/packages` 에 프로젝트들이 위치하며, 전체적인 구조는 다음과 같습니다:

```
 ui/
 ├── .yarn
 ├── package.json
 ├── ...
 └── packages/
     ├── mr-c.app/
     │   ├── package.json
     │   └── ...
     ├── common-components/
     │   ├── package.json
     │   └── ...
     ├── common-utils/
     │   ├── package.json
     │   └── ...
     └── ...(more packages)
```

## 스크립트

| script            | description                                         |
| ----------------- | --------------------------------------------------- |
| mr-c.app          | mr-c.app 프로젝트의 스크립트를 실행합니다.          |
| common-components | common-components 프로젝트의 스크립트를 실행합니다. |
| common-utils      | common-utils 프로젝트의 스크립트를 실행합니다.      |
| test:affected     | 변경된 프로젝트의 테스트를 실행합니다.              |
| test:all          | 모든 프로젝트의 테스트를 실행합니다.                |

### 개별 프로젝트의 스크립트 실행

1. 개별 프로젝트의 스크립트는 `ui`의 루트 경로에서 `yarn workspace ${프로젝트명} 스크립트` 로 실행할 수 있습니다.

   다음의 설정을 통해 스크립트를 간결하게 실행합니다:

   ```jsonc
   // ui/package.json

   "scripts": {
      "mr-c.app": "yarn workspace @mrc/mr-c.app",
      "common-components": "yarn workspace @mrc/common-components",
      ...
   }
   ```

2. 예시. `mr-c.app` 프로젝트의 `dev` 스크립트 실행 :

   ```bash
   yarn mr-c.app dev
   ```

### 테스트

1. `test:affected` : 변경된 프로젝트와 그에 의존하는 프로젝트의 테스트를 실행합니다.

   ```jsonc
   "test:affected": "yarn workspaces foreach --since -pR run test",
   ```

   > [yarn workspaces foreach](https://yarnpkg.com/cli/workspaces/foreach) 의 [--since](https://github.com/yarnpkg/berry/issues/2374) 옵션은 `.yarnrc.yml`의 [changesetBaseRefs](https://yarnpkg.com/configuration/yarnrc#changesetBaseRefs) 을 기준으로 변경된 프로젝트를 찾습니다. 변경된 프로젝트와 그에 의존하는 프로젝트의 테스트를 실행합니다.
   >
   > ```yml
   > # ui/.yarnrc.yml
   >
   > changesetBaseRefs: [develop, baseRef]
   > ```

2. `test:all` : 모든 프로젝트의 테스트를 실행합니다.

   ```jsonc
   "test:all": "yarn workspaces foreach --all run test"
   ```

## 프로젝트 설정

### 프로젝트간 참조

1. `yarn workspace` 로 관리되는 프로젝트는 해당 프로젝트의 패키지명 (`package.json`의 `name`) 으로 식별되며, [`workspace:` 프로토콜](https://yarnpkg.com/features/workspaces#cross-references)을 따라 참조관계를 설정합니다.

   예시:

   ```bash
   yarn add @mrc/common-components@'workspace:*'
   ```

   ```jsonc
   // ui/packages/mr-c.app/package.json

   "dependencies": {
      "@mrc/common-components": "workspace:*",
      "@mrc/common-utils": "workspace:*",
      ...
   }
   ```

2. 각 프로젝트는 `TypeScript` 로 작성되었으며, 공용으로 사용되는 프로젝트를 미리 트랜스파일 하지 않습니다.
   다른 프로젝트를 참조할 경우, `npm` 을 통해 배포된 패키지가 아닌 다른 워크스페이스의 소스코드를 직접 사용합니다.

   `nextjs` 프로젝트에서 다른 워크스페이스의 프로젝트를 참조하는 경우, `next.config` 의 [`transpilePackages`](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages) 에 추가합니다.

   ```javascript
   // ui/packages/mr-c.app/next.config.js

   module.exports = {
      transpilePackages: [
         '@mrc/common-components',
         '@mrc/common-utils',
         ...
      ],
      ...
   }
   ```

   > `transpilePackage` 에 추가되어 `nextjs` 가 트랜스파일하는 경우, `nextjs` 의 컴파일러(SWC)는 해당 프로젝트의 로컬 `tsconfig` 를 참조하지 않습니다. 따라서 참조되는 프로젝트는 `paths` 설정을 통한 alias 대신 상대 경로를 사용하여 코드를 작성해야합니다.

### 프로젝트 추가

1. `ui/packages` 의 하위 디렉토리로 프로젝트를 추가합니다.
   ```bash
   cd packages
   mkdir new-package
   ```
2. 추가된 프로젝트를 `workspace` 로 등록 하고 `package.json` 을 초기화합니다.

   ```bash
   cd new-package
   yarn init
   # new-package의 package.json 작성
   ```

   > `yarn init` 을 실행하면 `package.json` 이 초기화 되므로, `yarn init` 실행 후에 `package.json` 의 내용을 수정합니다.

   ```
   ...
    packages
    ├── mr-c.app
    ├── common-components
    ├── common-utils
    ...
    ├── new-package <- 추가된 프로젝트
    │   ├── package.json
    ...
   ```

   > [`yarn workspaces list`](https://yarnpkg.com/cli/workspaces/list) 를 실행하여 새로운 프로젝트가 `workspace` 로 추가된 것을 확인할 수 있습니다.

3. `new-package` 를 사용할 프로젝트로 이동하여, `yarn add` 명령어를 통해 의존성을 추가합니다.

   ```bash
   cd ../mr-c.app
   yarn add new-package@'workspace:*'
   ```

   > `yarn add` 명령어를 통해 `lockfile` 에 `new-package` 가 반영됩니다. `lockfile` 에 반영되지 않은 `workspace` 가 존재하는 경우, `mrc-ui` 에서 `yarn` 의 정상적인 스크립트 실행이 불가능합니다. [참고](https://github.com/MovieReviewComment/Mr.C/pull/55#discussion_r1332611264)

4. `ui/package.json` 에 다음의 스크립트를 추가합니다.

   ```jsonc
   // ui/package.json

   "scripts": {
   ...
   "new-package": "yarn workspace ${new-package의 패키지명}"
   }
   ```
