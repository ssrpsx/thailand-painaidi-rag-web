SET NAMES utf8mb4;
DROP SCHEMA IF EXISTS `pai_nai_di`;
CREATE SCHEMA `pai_nai_di`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE `pai_nai_di`;


-- ---------------------------------------------------------------------
-- users (anonymous users — no signup, identified by a cookie UUID)
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
    `user_id`     CHAR(36)    NOT NULL,                       -- UUID v4 from cookie
    `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_seen`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- places (tourist attractions)
-- ---------------------------------------------------------------------
CREATE TABLE `places` (
    `id`                INT          NOT NULL AUTO_INCREMENT,
    `name_th`           VARCHAR(255) NOT NULL,
    `name_en`           VARCHAR(255) NULL,
    `nearby`            TEXT         NULL,
    `address`           TEXT         NULL,
    `region`            VARCHAR(50)  NULL,                    -- เหนือ / กลาง / อีสาน / ใต้ / ตะวันออก / ตะวันตก
    `soi`               VARCHAR(100) NULL,
    `road`              VARCHAR(100) NULL,
    `subdistrict`       VARCHAR(100) NULL,
    `district`          VARCHAR(100) NULL,
    `province`          VARCHAR(100) NULL,
    `type`              VARCHAR(100) NULL,                    -- main category (ธรรมชาติ / วัฒนธรรม / ผจญภัย ...)
    `subtype`           VARCHAR(100) NULL,
    `contact_info`      TEXT         NULL,
    `phone`             VARCHAR(50)  NULL,
    `email`             VARCHAR(255) NULL,
    `website`           VARCHAR(500) NULL,
    `facebook`          VARCHAR(500) NULL,
    `instagram`         VARCHAR(500) NULL,
    `line`              VARCHAR(255) NULL,
    `tiktok`            VARCHAR(500) NULL,
    `youtube`           VARCHAR(500) NULL,
    `opening_hours`     TEXT         NULL,                    -- free-form (e.g. "จ-ศ 8:00-17:00, ส-อา ปิด")
    `description`       TEXT         NULL,
    `activities`        TEXT         NULL,
    `best_time`         VARCHAR(255) NULL,
    `fee_thai_adult`    VARCHAR(100) NULL,                    -- VARCHAR — fees may include "ฟรี" or notes
    `fee_thai_child`    VARCHAR(100) NULL,
    `fee_foreign_adult` VARCHAR(100) NULL,
    `fee_foreign_child` VARCHAR(100) NULL,
    `notes`             TEXT         NULL,
    `coords`            VARCHAR(100) NULL,                    -- "lat,lng" (e.g. "13.7563,100.5018")
    PRIMARY KEY (`id`),
    KEY `idx_place_province` (`province`),
    KEY `idx_place_region`   (`region`),
    KEY `idx_place_type`     (`type`),
    FULLTEXT KEY `ft_place_search` (`name_th`, `name_en`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- images (one place → many photos)
-- ---------------------------------------------------------------------
CREATE TABLE `images` (
    `image_id`    INT          NOT NULL AUTO_INCREMENT,
    `place_id`    INT          NOT NULL,                      -- FK → places.id
    `image_url`   VARCHAR(500) NOT NULL,                      -- /uploads/... or absolute URL
    `caption`     VARCHAR(255) NULL,
    `sort_order`  INT          NOT NULL DEFAULT 0,            -- 0 = cover photo
    `uploaded_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`image_id`),
    KEY `idx_image_place` (`place_id`),
    CONSTRAINT `fk_image_place`
        FOREIGN KEY (`place_id`) REFERENCES `places` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- favorites (per-user favorites — populated when the user swipes right)
-- ---------------------------------------------------------------------
CREATE TABLE `favorites` (
    `favorite_id` INT       NOT NULL AUTO_INCREMENT,
    `user_id`     CHAR(36)  NOT NULL,                         -- FK → users.user_id
    `place_id`    INT       NOT NULL,                         -- FK → places.id
    `note`        TEXT      NULL,                             -- optional note from the user
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`favorite_id`),
    UNIQUE KEY `uniq_user_place` (`user_id`, `place_id`),
    KEY `idx_fav_user`  (`user_id`),
    KEY `idx_fav_place` (`place_id`),
    CONSTRAINT `fk_fav_user`
        FOREIGN KEY (`user_id`)  REFERENCES `users`  (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_fav_place`
        FOREIGN KEY (`place_id`) REFERENCES `places` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- chat_history (per-user chat history for RAG memory)
-- ---------------------------------------------------------------------
CREATE TABLE `chat_history` (
    `message_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`    CHAR(36)     NOT NULL,
    `role`       ENUM('user','assistant','system') NOT NULL,
    `content`    MEDIUMTEXT   NOT NULL,
    `sources`    JSON         NULL,                           -- [{place_id, title}, ...]
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`message_id`),
    KEY `idx_chat_user_time` (`user_id`, `created_at`),
    CONSTRAINT `fk_chat_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- MOCK DATA
-- ---------------------------------------------------------------------
INSERT INTO `places` (`id`, `name_th`, `name_en`, `province`, `region`, `type`, `description`, `coords`) VALUES
(1, 'วัดพระศรีรัตนศาสดาราม (วัดพระแก้ว)', 'Temple of the Emerald Buddha (Wat Phra Kaew)', 'กรุงเทพมหานคร', 'กลาง', 'วัฒนธรรม', 'วัดคู่บ้านคู่เมืองของประเทศไทย ภายในประดิษฐานพระพุทธมหามณีรัตนปฏิมากร หรือพระแก้วมรกต', '13.7516,100.4927'),
(2, 'อุทยานแห่งชาติดอยอินทนนท์', 'Doi Inthanon National Park', 'เชียงใหม่', 'เหนือ', 'ธรรมชาติ', 'ยอดเขาที่สูงที่สุดในประเทศไทย มีธรรมชาติที่อุดมสมบูรณ์ และอากาศหนาวเย็นตลอดปี', '18.5883,98.4862'),
(3, 'หาดไร่เลย์', 'Railay Beach', 'กระบี่', 'ใต้', 'ทะเล', 'ชายหาดที่สวยงามล้อมรอบด้วยหน้าผาหินปูนสูงชัน เป็นที่นิยมสำหรับนักปีนผาและผู้ที่ชื่นชอบทะเล', '8.0116,98.8375'),
(4, 'ตลาดน้ำดำเนินสะดวก', 'Damnoen Saduak Floating Market', 'ราชบุรี', 'ตะวันตก', 'ช้อปปิ้ง', 'ตลาดน้ำที่มีชื่อเสียงที่สุดแห่งหนึ่งของไทย สัมผัสวิถีชีวิตริมน้ำและเลือกซื้อสินค้าหลากหลายบนเรือพาย', '13.5186,99.9602'),
(5, 'อุทยานประวัติศาสตร์พระนครศรีอยุธยา', 'Ayutthaya Historical Park', 'พระนครศรีอยุธยา', 'กลาง', 'ประวัติศาสตร์', 'อดีตราชธานีของไทยที่ได้รับการขึ้นทะเบียนเป็นมรดกโลกโดยยูเนสโก มีโบราณสถานที่งดงามมากมาย', '14.3555,100.5585');

INSERT INTO `images` (`place_id`, `image_url`, `sort_order`) VALUES
(1, 'https://images.unsplash.com/photo-1579768641916-fba48493f0b2?q=80&w=600', 0),
(2, 'https://images.unsplash.com/photo-1582298910052-ebaf4ec54199?q=80&w=600', 0),
(3, 'https://images.unsplash.com/photo-1600862083652-32a819c63286?q=80&w=600', 0),
(4, 'https://images.unsplash.com/photo-1549488344-c75c80a2df33?q=80&w=600', 0),
(5, 'https://images.unsplash.com/photo-1588691524316-ebcd2a255bc2?q=80&w=600', 0);
