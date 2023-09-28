# @mrc/common-utils

공통으로 사용하는 유틸리티를 담당하는 프로젝트입니다.

## 목차

- [@mrc/common-utils](#mrccommon-utils)
  - [목차](#목차)
  - [사용하기](#사용하기)
  - [스크립트](#스크립트)

## 사용하기

1. [`Mr.C/ui` 프로젝트간 참조](../../README.md#프로젝트간-참조) 에 따라 설정합니다.

2. 사용 예시

   ```typescript
   import { hello } from '@mrc/common-utils';

   const message = hello('world');

   console.log(message); // Hello, world!
   ```

## 스크립트

| script | description               |
| ------ | ------------------------- |
| test   | 유닛 테스트를 실행합니다. |
