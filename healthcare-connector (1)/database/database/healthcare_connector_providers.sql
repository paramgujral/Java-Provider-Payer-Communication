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
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `providers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `updated_date` datetime(6) DEFAULT NULL,
  `active` bit(1) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `provider_code` varchar(255) DEFAULT NULL,
  `provider_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `providers`
--

LOCK TABLES `providers` WRITE;
/*!40000 ALTER TABLE `providers` DISABLE KEYS */;
INSERT INTO `providers` VALUES (1,'2026-06-26 23:24:21.173605','2026-06-26 23:24:21.173605',_binary '','Hyderabad','apollo@hospital.com','9876543210','PROV-1782496461132','Apollo Hospital'),(2,'2026-06-27 02:02:09.025066','2026-06-27 02:02:09.025066',_binary '',NULL,NULL,'9877887787','PROV-1782505929007',NULL),(3,'2026-06-28 16:12:59.456807','2026-06-28 16:12:59.456807',_binary '','shedbal','patilsourabh020@gmail.com','9108114729','PROV-1782643379448','Sourabh'),(6,'2026-06-28 16:24:37.284546','2026-06-28 16:24:37.284546',_binary '','','patilsourah220@gmail.com','9878675758','PROV-1782644077282','cicil hospital'),(7,'2026-06-28 16:29:22.033736','2026-06-28 16:29:22.033736',_binary '','','patil@gmail.com','8889787888','PROV-1782644362033','ss '),(8,'2026-06-28 19:08:05.630687','2026-06-28 19:08:05.630687',_binary '','shedbal','patilsourbh02hhh20@gmail.com','8758758752','PROV-1782653885628','care provider'),(9,'2026-06-28 19:34:05.588609','2026-06-28 19:34:05.588609',_binary '','Basav Nagar','virendra@gmail.com','5970432767','PROV-1782655445588','Om Care'),(11,'2026-06-28 20:26:24.545371','2026-06-28 20:26:24.545371',_binary '','shedbal','patilsourabh02020@gmail.com','8776678777','PROV-1782658584545','i Care'),(12,'2026-06-28 20:41:30.502035','2026-06-28 20:41:30.502035',_binary '','Basav Nagar','sourabhgpantil999@gmail.com','08970432767','PROV-1782659490500','hOPITAL'),(13,'2026-06-28 20:46:29.127828','2026-06-28 20:46:29.127828',_binary '','Basav Nagar','sourabhgpatil9@gmail.com','08970432767','PROV-1782659789124','Care Take'),(14,'2026-06-28 20:48:54.953939','2026-06-28 20:48:54.953939',_binary '','Basav Nagar','sourabhgpatil99@gmail.com','08970432767','PROV-1782659934953','Ashoka Hospital'),(15,'2026-06-28 20:56:58.881441','2026-06-28 20:56:58.881441',_binary '','Basav Nagar','urabhgpatil999@gmail.com','0970432767','PROV-1782660418881','Ganaga Medicle'),(16,'2026-06-28 21:10:30.936945','2026-06-28 21:10:30.936945',_binary '','shedbal','patisourabh0220@gmail.com','3454355433','PROV-1782661230935','Shree Hospital');
/*!40000 ALTER TABLE `providers` ENABLE KEYS */;
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
