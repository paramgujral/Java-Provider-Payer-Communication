-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: healthcare_connector
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `authorization_requests`
--

DROP TABLE IF EXISTS `authorization_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorization_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `updated_date` datetime(6) DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `procedure_code` varchar(255) DEFAULT NULL,
  `request_number` varchar(255) DEFAULT NULL,
  `requested_amount` decimal(38,2) DEFAULT NULL,
  `status` enum('APPROVED','DRAFT','REJECTED','SUBMITTED','UNDER_REVIEW') DEFAULT NULL,
  `patient_id` bigint DEFAULT NULL,
  `payer_id` bigint DEFAULT NULL,
  `provider_id` bigint DEFAULT NULL,
  `rejection_reason` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtd4bnfu532742vww8ua3o60ic` (`patient_id`),
  KEY `FKrflo34bgyiaqmdfdafxf94h0p` (`payer_id`),
  KEY `FKkymmwhabihp5uynd27ftmobui` (`provider_id`),
  CONSTRAINT `FKkymmwhabihp5uynd27ftmobui` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`),
  CONSTRAINT `FKrflo34bgyiaqmdfdafxf94h0p` FOREIGN KEY (`payer_id`) REFERENCES `payers` (`id`),
  CONSTRAINT `FKtd4bnfu532742vww8ua3o60ic` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorization_requests`
--

LOCK TABLES `authorization_requests` WRITE;
/*!40000 ALTER TABLE `authorization_requests` DISABLE KEYS */;
INSERT INTO `authorization_requests` VALUES (1,'2026-06-27 01:49:27.456201','2026-06-29 01:07:39.975719','Heart Surgery','HS100','AUTH-1782505167449',250000.00,'APPROVED',1,1,1,NULL),(2,'2026-06-27 02:25:19.011519','2026-06-29 02:31:35.419729','Heart Surgery','HS100','AUTH-1782507319003',250000.00,'APPROVED',1,1,1,NULL);
/*!40000 ALTER TABLE `authorization_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-29 15:45:32
