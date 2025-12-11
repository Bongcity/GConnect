-- ============================================
-- Google Search Console 통계 테이블 생성
-- ============================================
-- 이 스크립트는 idempotent하게 작성되었습니다 (여러 번 실행해도 안전)

-- GoogleSearchStats 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GoogleSearchStats')
BEGIN
    CREATE TABLE GoogleSearchStats (
        id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
        
        -- 상품 정보
        productId BIGINT NOT NULL,
        productUrl NVARCHAR(1000) NOT NULL,
        
        -- 날짜
        [date] DATE NOT NULL,
        
        -- 지표
        impressions INT NOT NULL DEFAULT 0,
        clicks INT NOT NULL DEFAULT 0,
        
        -- 타임스탬프
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        -- 외래 키
        CONSTRAINT FK_GoogleSearchStats_Product 
            FOREIGN KEY (productId) REFERENCES affiliate_products(id) ON DELETE CASCADE,
        
        -- 유니크 제약 (같은 상품, 같은 날짜는 1개만)
        CONSTRAINT UQ_GoogleSearchStats_ProductId_Date 
            UNIQUE (productId, [date])
    );
    
    -- 인덱스 생성
    CREATE INDEX IX_GoogleSearchStats_productId ON GoogleSearchStats(productId);
    CREATE INDEX IX_GoogleSearchStats_date ON GoogleSearchStats([date]);
    
    PRINT 'GoogleSearchStats 테이블 생성 완료';
END
ELSE
BEGIN
    PRINT 'GoogleSearchStats 테이블이 이미 존재합니다';
END
GO

