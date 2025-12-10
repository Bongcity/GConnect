-- =============================================
-- affiliate_products_detail 테이블 생성
-- 네이버 커머스 API에서 가져온 상품 상세 정보 저장
-- =============================================

USE [GCONNECT]
GO

-- 기존 테이블이 있으면 삭제 (주의: 프로덕션에서는 주석 처리)
-- DROP TABLE IF EXISTS [dbo].[affiliate_products_detail]
-- GO

CREATE TABLE [dbo].[affiliate_products_detail](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[product_id] [bigint] NOT NULL,
	
	-- 원본 상품 정보
	[origin_product_no] [bigint] NULL,
	[channel_product_no] [bigint] NULL,
	
	-- 판매/전시 상태
	[status_type] [nvarchar](50) NULL,
	[display_status] [nvarchar](50) NULL,
	
	-- 가격/할인 정보
	[original_price] [bigint] NULL,
	[discount_rate] [float] NULL,
	[mobile_discounted_price] [bigint] NULL,
	
	-- 배송 정보
	[delivery_attribute_type] [nvarchar](50) NULL,
	[delivery_fee] [bigint] NULL,
	[return_fee] [bigint] NULL,
	[exchange_fee] [bigint] NULL,
	
	-- 포인트 정보
	[seller_purchase_point] [int] NULL,
	[seller_purchase_point_unit] [nvarchar](20) NULL,
	[manager_purchase_point] [int] NULL,
	[text_review_point] [int] NULL,
	[photo_video_review_point] [int] NULL,
	[regular_customer_point] [int] NULL,
	
	-- 혜택 정보
	[free_interest] [int] NULL,
	[gift] [nvarchar](500) NULL,
	
	-- 카테고리 정보
	[category_id] [nvarchar](50) NULL,
	[whole_category_id] [nvarchar](200) NULL,
	[whole_category_name] [nvarchar](500) NULL,
	
	-- 브랜드/제조사 정보
	[brand_name] [nvarchar](200) NULL,
	[manufacturer_name] [nvarchar](200) NULL,
	
	-- 기타
	[knowledge_shopping_registration] [bit] NULL,
	
	-- 타임스탬프
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
	
	CONSTRAINT [affiliate_products_detail_pkey] PRIMARY KEY CLUSTERED ([id] ASC)
		WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
		      ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) 
		ON [PRIMARY],
	
	CONSTRAINT [affiliate_products_detail_product_id_unique] UNIQUE NONCLUSTERED ([product_id] ASC)
		WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, 
		      ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) 
		ON [PRIMARY]
) ON [PRIMARY]
GO

-- 기본값 설정
ALTER TABLE [dbo].[affiliate_products_detail] 
	ADD CONSTRAINT [affiliate_products_detail_created_at_df] DEFAULT (getdate()) FOR [created_at]
GO

ALTER TABLE [dbo].[affiliate_products_detail] 
	ADD CONSTRAINT [affiliate_products_detail_updated_at_df] DEFAULT (getdate()) FOR [updated_at]
GO

-- 인덱스 생성
CREATE NONCLUSTERED INDEX [IX_affiliate_products_detail_product_id] 
	ON [dbo].[affiliate_products_detail] ([product_id] ASC)
GO

CREATE NONCLUSTERED INDEX [IX_affiliate_products_detail_status_type] 
	ON [dbo].[affiliate_products_detail] ([status_type] ASC)
GO

CREATE NONCLUSTERED INDEX [IX_affiliate_products_detail_category_id] 
	ON [dbo].[affiliate_products_detail] ([category_id] ASC)
GO

PRINT '✅ affiliate_products_detail 테이블 생성 완료'
GO

