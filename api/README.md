목차
- [개요](#개요)
- [로컬 인프라 설정](#로컬-인프라-설정)
- [DB 설정](#db-설정)
  - [명령어 설명](#명령어-설명)
  - [마이그레이션](#마이그레이션)
    - [1. 스키마 편집](#1-스키마-편집)
    - [2. 환경 변수 로드](#2-환경-변수-로드)
    - [3. 마이그레이션 롤백 파일 생성](#3-마이그레이션-롤백-파일-생성)
    - [4. 마이그레이션 파일 생성](#4-마이그레이션-파일-생성)
    - [5. 트랜잭션 적용을 위한 마이그레이션 및 롤백 파일 수정](#5-트랜잭션-적용을-위한-마이그레이션-및-롤백-파일-수정)
    - [6. 마이그레이션 적용](#6-마이그레이션-적용)
    - [7. 마이그레이션 롤백](#7-마이그레이션-롤백)
    - [마이그레이션 내용 확인](#마이그레이션-내용-확인)
    - [마이그레이션 실패 시 대처](#마이그레이션-실패-시-대처)
- [서버 실행](#서버-실행)
- [테스트](#테스트)

# 개요
`Mr.C`의 API를 담당하는 프로젝트입니다. 이 프로젝트는 `Mr.C` 서비스의 백엔드를 구축하고 관리하는 역할을 합니다.

# 로컬 인프라 설정
Docker 관련 모든 명령어는 `api` 폴더에서 실행하도록 합니다.

1. Docker image 다운로드
   ```bash
    docker compose pull # 이미지 다운로드
   ```

2. Docker container 생성 및 실행
    ```bash
    docker compose --env-file .env -p mrc-api up -d # 컨테이너를 백그라운드에 생성 및 실행
    ```

3. Docker container 정지 및 삭제 (모든 인프라 사용이 종료됐을 경우)  
    ```bash
    docker compose -p mrc-api down # 컨테이너 정지 및 삭제
    ```

# DB 설정

## 명령어 설명 
```bash
npm run migrate-create:down # 마이그레이션 롤백 파일 생성
npm run migrate-create:up # 마이그레이션 파일 생성
npm run migrate-apply:rollback # 마이그레이션 롤백
npm run migrate-apply:all # 모든 마이그레이션 적용 및 ORM 클라이언트 타입 갱신
npm run migrate-apply:latest # 아직 적용되지 않은 마이그레이션만 적용
npm run migrate-status # 마이그레이션 상태 확인
npm run generate-models # ORM 클라이언트 타입 갱신
npm run studio # DB GUI 실행
```

## 마이그레이션
로컬에서 마이그레이션을 하는 경우 먼저  [로컬 인프라 설정](#로컬-인프라-설정) 의 과정을 완료합니다.

### 1. 스키마 편집
`prisma/schema.prisma` 파일의 내용을 편집합니다. 

### 2. 환경 변수 로드
`load_dotenv.sh` 스크립트를 실행하여 쉘에 환경 변수를 로드합니다.

```bash
. ./scripts/load_dotenv.sh
```

> [!NOTE]  
> 올바르게 환경 변수가 로드 되지 않았을 경우, 마이그레이션의 다음 과정에서 문제가 생길 수 있습니다. 따라서 `printenv` 명령어를 통해 환경 변수의 값이 쉘에 제대로 로드 되었는지 먼저 확인하도록 합니다. 

### 3. 마이그레이션 롤백 파일 생성
`npm run migrate-create:down` 명령어를 실행시켜 마이그레이션 롤백 파일(`down.sql`)을 생성합니다. 이 `down.sql` 파일은 [4.마이그레이션 파일 생성](#4-마이그레이션-파일-생성) 과정을 마친 후에 이 과정에서 생성된 폴더로 이동시키도록 합니다.

> [!NOTE]  
> 마이그레이션 롤백 파일을 만들기전에 마이그레이션 파일을 생성하면 히스토리가 갱신되기 때문에 롤백 파일이 제대로 생성되지 않을 수 있습니다. 따라서 반드시 마이그레이션 파일을 생성하기 전에 롤백 파일을 먼저 생성하도록 합니다.

> [!NOTE]  
> 뷰와 트리거에 대한 마이그레이션 및 롤백에 대한 내용은 수동으로 직접 작성해야 합니다.

### 4. 마이그레이션 파일 생성
`npm run migrate-create:up` 명령어를 실행시켜 마이그레이션 파일을 생성합니다. 

> [!IMPORTANT]  
> `npm run migrate-create:up` 명령어는 `migrations` 폴더의 내용과 타깃 데이터베이스의 상태가 다르면 데이터베이스의 리셋을 다음과 같이 유도할 수 있습니다. 아래와 같이 선택지가 나타날 경우, [공식 문서](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/troubleshooting-development)를 참고하여 대처하도록 합니다.
```
❯ npm run migrate-create:up

> mrc-api@0.0.1 migrate-create:up
> npx prisma migrate dev --create-only

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "mrc", schema "public" at "localhost:5432"

The following migration(s) are applied to the database but missing from the local migrations directory: 20231017093120_add_profile_user
✔ We need to reset the "public" schema at "localhost:5432"
Do you want to continue? All data will be lost.
```

### 5. 트랜잭션 적용을 위한 마이그레이션 및 롤백 파일 수정

[마이그레이션 롤백 파일 생성](#3-마이그레이션-롤백-파일-생성) 및 [마이그레이션 파일 생성](#4-마이그레이션-파일-생성) 단계에서 생성된 `xxx.sql` 파일의 시작 부분과 끝 부분에 각각 `BEGIN` 및 `COMMIT` 구문을 추가하여 마이그레이션 및 롤백 프로세스가 전체적으로 원자성을 유지하게끔 수정합니다.


### 6. 마이그레이션 적용
마이그레이션 적용은 상황에 따라 다를 수 있습니다. 

**Case 1: 모든 마이그레이션 적용**  
모든 마이그레이션들이 DB 에 적용되어야 한다면 `npm run migrate-apply:all` 명령어를 실행합니다. 해당 명령어를 실행하면 현재 `prisma/migrations` 폴더에 작성되어 있는 모든 내용들이 데이터베이스에 반영됩니다. 

> [!IMPORTANT]  
> `npm run migrate-apply:all` 명령어는 타깃 데이터베이스의 상태가 현재 모든 마이그레이션이 적용된 데이터베이스의 상태와 다를 경우 리셋을 유도할 수 있습니다. 자세한 내용은 아래 문서에서 확인할 수 있습니다. 따라서 실제 서비스 환경의 데이터베이스에 마이그레이션 할때는 사용을 지양하도록 해야합니다.
- [migrate dev](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-dev)
- [Detecting schema drift](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#detecting-schema-drift)

**Case 2:  아직 적용되지 않은 마이그레이션만 적용**  
이미 존재하는 데이터베이스에 아직 적용되지 않은 마이그레이션만 적용하고자 할때는 `npm run migrate-apply:latest` 명령어를 사용합니다. 이미 적용된 마이그레이션은 스킵하고 적용되지 않은 내용만 적용하기 때문에 실제 서비스 환경에서 사용하기 적합합니다. 실제 서비스 환경에서 처음으로 마이그레이션을 적용한다면 [baselining](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining) 과정을 마친 후 마이그레이션을 진행하도록 합니다.

### 7. 마이그레이션 롤백
마이그레이션 롤백을 위해서는 [3.마이그레이션 롤백 파일 생성](#3-마이그레이션-롤백-파일-생성) 의 과정을 통해 생성한 마이그레이션 롤백 파일의 위치를 확인해야합니다. 파일의 위치를 확인하고 나서는 다음과 같이 명령어를 실행합니다.

```bash
npm run migrate-apply:rollback -- --file $rollback_file
```

### 마이그레이션 내용 확인
`npm run migrate-status` 또는 `npm run studio` 를 통해 마이그레이션 적용 여부를 확인합니다.

### 마이그레이션 실패 시 대처
마이그레이션 실패 시에는 다음의 [문서](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/troubleshooting-development#schema-drift)를 참고하여 대처하도록 합니다.

# 서버 실행
로컬 환경에서 서버를 실행시킬 경우 다음 두 가지를 먼저 확인합니다.
1. [로컬 인프라 설정](#로컬-인프라-설정)에서 로컬 인프라가 올바르게 설정됐는지 확인.
2. [마이그레이션 진행](#마이그레이션)을 통해 변경된 스키마가 DB에  올바르게 반영됐는지 확인.

두 가지 사항을 확인했으면 아래의 과정을 통해 서버를 실행시킵니다.
1. 패키지 다운로드
   ```bash
   npm ci
   ```

2. 서버 실행
   ``` bash
   npm run start:dev
   ```

# 테스트

```bash
npm run test # 단위 테스트

npm run test:cov # 단위 테스트 및 코드 커버리지 확인
```
