-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 13, 2018 at 11:03 PM
-- Server version: 5.7.22-0ubuntu0.16.04.1
-- PHP Version: 7.0.30-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ScrabbleTournaments`
--

-- --------------------------------------------------------

--
-- Table structure for table `accountCreationRequests`
--

CREATE TABLE `accountCreationRequests` (
  `email` varchar(64) NOT NULL,
  `username` varchar(32) NOT NULL,
  `message` text NOT NULL,
  `OTP` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `leagueGames`
--

CREATE TABLE `leagueGames` (
  `id` int(11) NOT NULL,
  `leagueId` int(11) NOT NULL,
  `playerOne` varchar(32) NOT NULL,
  `playerTwo` varchar(32) NOT NULL,
  `label` varchar(16) DEFAULT NULL,
  `playerOneScore` int(11) DEFAULT NULL,
  `playerTwoScore` int(11) DEFAULT NULL,
  `scoreStatusCode` varchar(16) DEFAULT 'none',
  `gameResultCode` varchar(4) DEFAULT 'none'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Stand-in structure for view `leagueLeaderboards`
--
CREATE TABLE `leagueLeaderboards` (
`leagueId` int(11)
,`name` varchar(32)
,`username` varchar(32)
,`played` bigint(13)
,`wins` int(11)
,`draws` int(11)
,`losses` int(11)
,`points` decimal(15,4)
,`spread` bigint(12)
);

-- --------------------------------------------------------

--
-- Table structure for table `leagueParticipation`
--

CREATE TABLE `leagueParticipation` (
  `username` varchar(32) NOT NULL,
  `leagueId` int(11) NOT NULL,
  `wins` int(11) NOT NULL DEFAULT '0',
  `draws` int(11) NOT NULL DEFAULT '0',
  `losses` int(11) NOT NULL DEFAULT '0',
  `totalScore` int(11) NOT NULL DEFAULT '0',
  `totalScoreAgainst` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `leagues`
--

CREATE TABLE `leagues` (
  `id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL,
  `admin` varchar(32) NOT NULL,
  `noOfPlayers` int(11) NOT NULL DEFAULT '0',
  `gamesPerPair` int(11) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `username` varchar(32) NOT NULL,
  `email` varchar(64) DEFAULT NULL,
  `passHash` varchar(64) NOT NULL,
  `adminLevel` smallint(6) NOT NULL DEFAULT '0',
  `wins` int(11) NOT NULL DEFAULT '0',
  `draws` int(11) NOT NULL DEFAULT '0',
  `losses` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `refGameResultCode`
--

CREATE TABLE `refGameResultCode` (
  `gameResultCode` varchar(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `refGameResultCode`
--

INSERT INTO `refGameResultCode` (`gameResultCode`) VALUES
('DRAW'),
('none'),
('P1W'),
('P2W');

-- --------------------------------------------------------

--
-- Table structure for table `refScoreStatusCode`
--

CREATE TABLE `refScoreStatusCode` (
  `scoreStatusCode` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `refScoreStatusCode`
--

INSERT INTO `refScoreStatusCode` (`scoreStatusCode`) VALUES
('accepted'),
('none'),
('p1countered'),
('p1entered'),
('p2countered'),
('p2entered');

-- --------------------------------------------------------

--
-- Structure for view `leagueLeaderboards`
--
DROP TABLE IF EXISTS `leagueLeaderboards`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `leagueLeaderboards`  AS  select `leagueParticipation`.`leagueId` AS `leagueId`,`leagues`.`name` AS `name`,`leagueParticipation`.`username` AS `username`,((`leagueParticipation`.`wins` + `leagueParticipation`.`draws`) + `leagueParticipation`.`losses`) AS `played`,`leagueParticipation`.`wins` AS `wins`,`leagueParticipation`.`draws` AS `draws`,`leagueParticipation`.`losses` AS `losses`,(`leagueParticipation`.`wins` + (`leagueParticipation`.`draws` / 2)) AS `points`,(`leagueParticipation`.`totalScore` - `leagueParticipation`.`totalScoreAgainst`) AS `spread` from (`leagueParticipation` join `leagues` on((`leagueParticipation`.`leagueId` = `leagues`.`id`))) order by (`leagueParticipation`.`wins` + (`leagueParticipation`.`draws` / 2)) desc,(`leagueParticipation`.`totalScore` - `leagueParticipation`.`totalScoreAgainst`) desc ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accountCreationRequests`
--
ALTER TABLE `accountCreationRequests`
  ADD PRIMARY KEY (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `leagueGames`
--
ALTER TABLE `leagueGames`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leagueId` (`leagueId`),
  ADD KEY `playerOne` (`playerOne`),
  ADD KEY `playerTwo` (`playerTwo`),
  ADD KEY `scoreStatusCode` (`scoreStatusCode`),
  ADD KEY `gameResultCode` (`gameResultCode`);

--
-- Indexes for table `leagueParticipation`
--
ALTER TABLE `leagueParticipation`
  ADD PRIMARY KEY (`username`,`leagueId`),
  ADD KEY `leagueId` (`leagueId`);

--
-- Indexes for table `leagues`
--
ALTER TABLE `leagues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `admin` (`admin`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `refGameResultCode`
--
ALTER TABLE `refGameResultCode`
  ADD PRIMARY KEY (`gameResultCode`);

--
-- Indexes for table `refScoreStatusCode`
--
ALTER TABLE `refScoreStatusCode`
  ADD PRIMARY KEY (`scoreStatusCode`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `leagueGames`
--
ALTER TABLE `leagueGames`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
--
-- AUTO_INCREMENT for table `leagues`
--
ALTER TABLE `leagues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `leagueGames`
--
ALTER TABLE `leagueGames`
  ADD CONSTRAINT `leagueGames_ibfk_1` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leagueGames_ibfk_2` FOREIGN KEY (`playerOne`) REFERENCES `players` (`username`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `leagueGames_ibfk_3` FOREIGN KEY (`playerTwo`) REFERENCES `players` (`username`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `leagueGames_ibfk_4` FOREIGN KEY (`scoreStatusCode`) REFERENCES `refScoreStatusCode` (`scoreStatusCode`) ON UPDATE CASCADE,
  ADD CONSTRAINT `leagueGames_ibfk_5` FOREIGN KEY (`gameResultCode`) REFERENCES `refGameResultCode` (`gameResultCode`) ON UPDATE CASCADE;

--
-- Constraints for table `leagueParticipation`
--
ALTER TABLE `leagueParticipation`
  ADD CONSTRAINT `leagueParticipation_ibfk_1` FOREIGN KEY (`username`) REFERENCES `players` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leagueParticipation_ibfk_2` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leagues`
--
ALTER TABLE `leagues`
  ADD CONSTRAINT `leagues_ibfk_1` FOREIGN KEY (`admin`) REFERENCES `players` (`username`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
