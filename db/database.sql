CREATE DATABASE  IF NOT EXISTS `final_project_web` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `final_project_web`;
-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: final_project_web
-- ------------------------------------------------------
-- Server version	8.0.29

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `username` varchar(10) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `st_identify_card` varchar(100) DEFAULT NULL,
  `nd_identify_card` varchar(100) DEFAULT NULL,
  `account_day` datetime DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `reset_password` int DEFAULT NULL,
  `count_wrongpass` int DEFAULT NULL,
  `unusual_signin` int DEFAULT NULL,
  `account_balance` int DEFAULT NULL,
  `withdraw_accept` int DEFAULT NULL,
  `sex` varchar(3) DEFAULT NULL,
  `kind` varchar(45) DEFAULT NULL,
  `role` varchar(5) DEFAULT NULL,
  `lock_account_day` datetime DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `phone_UNIQUE` (`phone`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('9525782819','0124456789','pham34hoaibao.kai@gmail.com','31233213','2000-10-10','423423',NULL,NULL,'2022-05-26 09:49:57','$2b$10$Zhu9ks6QLEK.GZvhFy8ipeI0vqkySIjoIdrco4XRpIjQ4ME7nQlsu',0,0,NULL,0,2,'nam','TK1',NULL,NULL),('admin',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'$2a$12$Bi4HStzBpHcBYyJPZ0IQw.Zg.i9hp7HLJl4/qNNm6MGr5j5nu5Uly',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_card`
--

DROP TABLE IF EXISTS `phone_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_card` (
  `idPhone_card` varchar(10) NOT NULL,
  `username` varchar(10) DEFAULT NULL,
  `delivery_time` datetime DEFAULT NULL,
  `network_provider` varchar(30) DEFAULT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  `total_money` int DEFAULT NULL,
  `number_card` int DEFAULT NULL,
  `fee` int DEFAULT NULL,
  `id_gd` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`idPhone_card`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_card`
--

LOCK TABLES `phone_card` WRITE;
/*!40000 ALTER TABLE `phone_card` DISABLE KEYS */;
INSERT INTO `phone_card` VALUES ('3333314293','9822658482','2022-05-25 19:11:41','Vinaphone',NULL,500000,100000,0,'713072'),('3333362336','9822658482','2022-05-25 19:11:41','Vinaphone',NULL,500000,100000,0,'713072'),('3333362858','9822658482','2022-05-25 19:11:41','Vinaphone',NULL,500000,100000,0,'713072'),('3333377630','9822658482','2022-05-25 19:11:41','Vinaphone',NULL,500000,100000,0,'713072'),('3333394058','9822658482','2022-05-25 19:11:41','Vinaphone',NULL,500000,100000,0,'713072');
/*!40000 ALTER TABLE `phone_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `id` varchar(10) NOT NULL,
  `kind` int DEFAULT NULL,
  `username` varchar(10) DEFAULT NULL,
  `money` int DEFAULT NULL,
  `delivery_time` datetime DEFAULT NULL,
  `status` int DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `notes` varchar(100) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `delivery_fee` int DEFAULT NULL,
  `receiver_phone` varchar(10) DEFAULT NULL,
  `sothe` varchar(10) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `cvv` varchar(10) DEFAULT NULL,
  `nhamang` varchar(20) DEFAULT NULL,
  `menhgia` int DEFAULT NULL,
  `soluong` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES ('225249',0,'9822658482',50000,'2022-05-25 14:39:10',0,'Phạm Hoài Bảo',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('453145',0,'2616198884',1000000,'2022-05-22 15:32:46',0,'31233213',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('631283',1,'2616198884',1000000,'2022-05-23 20:32:13',0,NULL,NULL,NULL,50000,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('699248',1,'2616198884',1000000,'2022-05-22 15:34:04',0,NULL,NULL,NULL,50000,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('713072',3,'9822658482',500000,'2022-05-25 19:11:41',0,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'Vinaphone',100000,'5'),('765938',0,'9822658482',50000,'2022-05-25 19:11:28',0,'Phạm Hoài Bảo',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('784582',0,'2616198884',1000000,'2022-05-23 20:15:26',0,'31233213',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('931673',0,'2616198884',1000000,'2022-05-22 16:07:49',0,'31233213',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL),('956382',0,'2616198884',1000000,'2022-05-22 15:33:12',0,'31233213',NULL,NULL,NULL,NULL,'111111','2022-10-10','411',NULL,NULL,NULL);
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-26 10:28:53
