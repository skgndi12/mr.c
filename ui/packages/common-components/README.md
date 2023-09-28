# @mrc/common-components

공통으로 사용하는 컴포넌트를 담당하는 프로젝트입니다. `Storybook` 을 통해 컴포넌트를 확인할 수 있습니다.
`Storybook` 의 서버와 빌드는 `vite` 로 동작합니다.

## 목차

- [@mrc/common-components](#mrccommon-components)
  - [목차](#목차)
  - [스크립트](#스크립트)
  - [사용하기](#사용하기)

## 스크립트

| script          | description                                      |
| --------------- | ------------------------------------------------ |
| storybook       | Storybook dev 서버를 실행합니다 (localhost:6000) |
| build-storybook | Storybook을 빌드합니다 (storybook-static)        |
| test            | 유닛 테스트를 실행합니다.                        |

## 사용하기

1. [`Mr.C/ui` 프로젝트간 참조](../../README.md#프로젝트간-참조) 에 따라 설정합니다.
2. `TailwindCSS` 적용을 위해 `@mrc/common-components` 의 `tailwind.config` 를 참조합니다. ([@mrc/mr-c.app/tailwind.config.ts](../mr-c.app/tailwind.config.ts) 참고)

   ```typescript
   import mrcTailwind from '@mrc/common-components/tailwind.config';

   const config = {
     presets: [mrcTailwind],

     // `mrcTailwind.content` includes a path to the components that are using tailwind in @mrc/common-components
     content: mrcTailwind.content.concat([
       // Add your own paths
       // ex) './src/**/*.{js,ts,jsx,tsx,mdx}',
     ]),
     // ...
   };
   ```

3. 사용 예시

   ```typescript
   import { AtomicComponent } from '@mrc/common-components';

   const MyComponent = () => {
     return (
         <>
            <p>MyComponent</p>
            <AtomicComponent color='primary'>
         </>
     );
   };
   ```
