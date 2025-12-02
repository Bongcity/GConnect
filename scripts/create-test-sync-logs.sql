-- 동기화 로그 테스트 데이터 생성
USE GCONNECT;
GO

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '📋 동기화 로그 테스트 데이터 생성';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '';

-- 1. test@seller.com 사용자 ID 찾기
DECLARE @userId NVARCHAR(1000);
SELECT @userId = id FROM Users WHERE email = 'test@seller.com';

IF @userId IS NULL
BEGIN
    PRINT '❌ test@seller.com 사용자를 찾을 수 없습니다.';
    PRINT '먼저 scripts/reset-and-setup-all.sql을 실행하세요.';
END
ELSE
BEGIN
    -- 2. 기존 동기화 로그 삭제
    DELETE FROM SyncLogs WHERE userId = @userId;
    PRINT '🗑️  기존 동기화 로그 삭제 완료';
    PRINT '';

    -- 3. 최근 30일간 동기화 로그 생성 (총 15개)
    DECLARE @counter INT = 0;
    DECLARE @logDate DATETIME2;
    DECLARE @syncType NVARCHAR(50);
    DECLARE @status NVARCHAR(50);
    DECLARE @itemsTotal INT;
    DECLARE @itemsSynced INT;
    DECLARE @itemsFailed INT;
    DECLARE @errorLog NVARCHAR(MAX);
    DECLARE @randomValue FLOAT;

    WHILE @counter < 15
    BEGIN
        -- 날짜: 최근 30일 내 랜덤
        SET @logDate = DATEADD(DAY, -(@counter * 2), GETDATE());
        SET @logDate = DATEADD(HOUR, -(CAST(RAND() * 12 AS INT)), @logDate);

        -- 동기화 타입 (80% PRODUCT_SYNC, 20% MANUAL_SYNC)
        SET @randomValue = RAND();
        IF @randomValue < 0.8
            SET @syncType = 'PRODUCT_SYNC';
        ELSE
            SET @syncType = 'MANUAL_SYNC';

        -- 상태 (70% SUCCESS, 20% PARTIAL, 10% FAILED)
        SET @randomValue = RAND();
        IF @randomValue < 0.7
        BEGIN
            SET @status = 'SUCCESS';
            SET @itemsTotal = CAST(RAND() * 50 + 10 AS INT);
            SET @itemsSynced = @itemsTotal;
            SET @itemsFailed = 0;
            SET @errorLog = NULL;
        END
        ELSE IF @randomValue < 0.9
        BEGIN
            SET @status = 'PARTIAL';
            SET @itemsTotal = CAST(RAND() * 50 + 10 AS INT);
            SET @itemsFailed = CAST(RAND() * 5 + 1 AS INT);
            SET @itemsSynced = @itemsTotal - @itemsFailed;
            SET @errorLog = N'일부 상품 동기화 실패: 네이버 API 응답 지연 또는 상품 정보 불완전';
        END
        ELSE
        BEGIN
            SET @status = 'FAILED';
            SET @itemsTotal = CAST(RAND() * 50 + 10 AS INT);
            SET @itemsSynced = 0;
            SET @itemsFailed = @itemsTotal;
            SET @errorLog = N'동기화 실패: 네이버 API 인증 오류 또는 네트워크 연결 문제';
        END

        -- 로그 삽입
        INSERT INTO SyncLogs (
            id, userId, syncType, status, 
            itemsTotal, itemsSynced, itemsFailed, 
            errorLog, createdAt
        )
        VALUES (
            NEWID(),
            @userId,
            @syncType,
            @status,
            @itemsTotal,
            @itemsSynced,
            @itemsFailed,
            @errorLog,
            @logDate
        );

        SET @counter = @counter + 1;
    END

    PRINT '✅ 동기화 로그 15개 생성 완료';
    PRINT '';

    -- 4. 결과 확인
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '📊 생성된 로그 요약';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '';

    SELECT 
        status AS [상태],
        COUNT(*) AS [개수],
        SUM(itemsTotal) AS [총항목],
        SUM(itemsSynced) AS [성공],
        SUM(itemsFailed) AS [실패]
    FROM SyncLogs
    WHERE userId = @userId
    GROUP BY status
    ORDER BY 
        CASE status
            WHEN 'SUCCESS' THEN 1
            WHEN 'PARTIAL' THEN 2
            WHEN 'FAILED' THEN 3
        END;

    PRINT '';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '✅ 완료!';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '';
    PRINT '🔗 확인: http://localhost:3003/dashboard/sync-logs';
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    PRINT '';
END
GO

