-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-08-2025 a las 05:55:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `genweb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL,
  `doctorId` int(11) NOT NULL,
  `especialidad` varchar(255) NOT NULL,
  `modalidad` varchar(255) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `notas` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id`, `nombre`, `correo`, `telefono`, `doctorId`, `especialidad`, `modalidad`, `fecha`, `hora`, `notas`, `createdAt`, `updatedAt`, `estado`) VALUES
(56, 'Alonso1', 'alonso@email.com', '3423234', 1, 'Neurología', 'Presencial', '2025-08-18', '21:01:00', NULL, '2025-08-08 00:01:33', '2025-08-08 00:02:32', 'cancelada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `especialidad` varchar(255) NOT NULL,
  `modalidad` varchar(255) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `horarios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`horarios`)),
  `experiencia` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `doctors`
--

INSERT INTO `doctors` (`id`, `nombre`, `especialidad`, `modalidad`, `imagen`, `createdAt`, `updatedAt`, `telefono`, `email`, `horarios`, `experiencia`, `costo`, `activo`) VALUES
(1, 'Dr. Alonso Jimenez', 'Neurología', 'Presencial', 'doc1.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(2, 'Dra. Melissa Lara', 'Pediatría', 'Virtual', 'doc3.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(3, 'Dr. Diego Hernandez', 'Cardiología', 'Presencial', 'doc2.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(4, 'Dra. Kelly Palomares', 'Dermatología', 'Virtual', 'doc7.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(5, 'Dr. Mauricio Rocha', 'Infectología', 'Presencial', 'doc6.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(6, 'Dr. Alexis Hernandez', 'Otorrinolaringología', 'Presencial', 'doc5.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(7, 'Dr. Gonzalo Mendoza', 'Anestesiología', 'Virtual', 'doc4.png', '2025-03-01 01:38:17', '2025-03-01 01:38:17', NULL, NULL, NULL, NULL, NULL, 1),
(8, 'Dr. Test', 'Cardiolog�a', 'Presencial', 'doc1.png', '2025-08-07 06:47:46', '2025-08-07 06:47:46', NULL, 'test.doctor@medic.com', NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta`
--

CREATE TABLE `receta` (
  `id` int(11) NOT NULL,
  `citaId` int(11) NOT NULL,
  `nombrePaciente` varchar(255) NOT NULL,
  `doctorId` varchar(255) NOT NULL,
  `medicamento` varchar(255) NOT NULL,
  `dosis` varchar(255) NOT NULL,
  `frecuencia` varchar(255) NOT NULL,
  `duracion` varchar(255) NOT NULL,
  `indicaciones` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20230806_add_security_fields.js');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `failedLoginAttempts` int(11) NOT NULL DEFAULT 0,
  `isLocked` tinyint(1) NOT NULL DEFAULT 0,
  `lockExpiry` datetime DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `passwordResetToken` varchar(255) DEFAULT NULL,
  `passwordResetExpiry` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` enum('paciente','especialista') NOT NULL DEFAULT 'paciente',
  `specialKey` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `email`, `password`, `failedLoginAttempts`, `isLocked`, `lockExpiry`, `lastLogin`, `passwordResetToken`, `passwordResetExpiry`, `createdAt`, `updatedAt`, `role`, `specialKey`) VALUES
(1, 'Alonso', 'alonso@email.com', '$2b$10$wE8OcVVlclk/XeC4roSKQO4AvUfj7VQoK8tzCZ4538LH9bsivK6mO', 0, 0, NULL, '2025-08-08 03:48:40', NULL, NULL, '2025-08-07 06:25:47', '2025-08-08 03:48:40', 'paciente', NULL),
(2, 'Kelly', 'Kelly@email.com', '$2b$10$sEf070vvun6PBj8LkZf90eB36SOQ2mQpGmZuXmb89MoCC3DiS5eQC', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(3, 'mauro', 'mau@email.com', '$2b$10$yjxPy5tv905qHHS2x20iuOHQ2BDm3tXAI1FHlorJbyL/7CPjLRZRK', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(14, 'Kelly Hdz', 'kelly1@email.com', '$2b$10$AlltL2D82NTBfk0ufqmivuSKm.feb6eed2ypSrBih2r5wpCmPi.Ne', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(15, 'Alonso J', 'alonso11@gmail.com', '$2b$10$PViffv99iIeRAnjcgvt7Wuye4vezQI7/D4bsgdEZgYnnhzA15mCiW', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(16, 'Alonso CR7', '21158@virtual.utsc.edu.mx', '$2b$10$VS9kiW8FQek1483CpDqSNOQVIf0c7FQ7AjwEu7v07rSn/1hkRqrGO', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(17, 'IKECRACK777', '21150@virtual.utsc.edu.mx', '$2b$10$xu7a5CvOpd1wWJqi5viPy.2mnuoconb22dw9QJTZHyPYSzthVhzF6', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(18, 'Kelly Hdz', 'alo@sisco.com', '$2b$10$g.kEYSNP3GtwAVLMVH0TVOE0V82UquGgH8gRg2SixlCHGx7xIshEW', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(19, 'alex', 'alexotesgabo03@outlook.com', '$2b$10$jy5BPeQ5a2rfIuKUJV87DOo5mPWwOFoexquKNMot11DDwd6k.eN62', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(20, 'Yameilet', 'yamiletgtzflrs@gmail.com', '$2b$10$53VnqoJ1pJkdI/6wDPUOze0HlfT96/iTOBi0OQ11MS/iRf0MqO0d6', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(21, 'Yameilet JJ', 'yamilet@gmail.com', '$2b$10$TzB70P2YfBTFiEcnzVao7OyeRgppm/aww5c8jXfoS4/Te/WVHoRKS', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(22, 'Alonso', 'alonso@gmail.com', '$2b$10$pVRNrwIPcbVlepBvI4fbCeCRdDI58wpdzqGLu.fXyL98LhRXjAEqu', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(23, 'Lizbeth Ovalle', 'lflores@madisa.com', '$2b$10$RV31hQL3fLb0CGXdFefOo.XCEpVAzYsmTcrLAYUbUyTRxtWdXSwjy', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(24, 'Berenice', 'bere@gmail.com', '$2b$10$AyAGPg6WCqnOoqZrK5G/iuSAvP4JHR0nL1ypDGbip.Zllus.Ny7Gq', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(25, 'Berenicexd', 'berexd@gmail.com', '$2b$10$QkbJFjz8kgut/6d0ObCGNuM/6gAfNMIZ8ci6wuR8IwdMy0huXYwJu', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:25:47', '2025-08-07 06:25:47', 'paciente', NULL),
(33, 'Berenice', 'alonso77@gmail.com', '$2b$10$JH0cWpMQqojm0uU.m71Ks.WYHmA9AX3Bb9K2N9H5TA1SjZmsKbRIC', 0, 0, NULL, '2025-08-08 00:00:53', NULL, NULL, '2025-08-07 06:25:47', '2025-08-08 00:00:53', 'paciente', NULL),
(37, 'Juan Paciente', 'juan@test.com', '$2b$10$uy2TsKfYj86uCaWsHb6N/u6ObVHrzD9pR2Kv4zefxOZVFqFvuOwvi', 0, 0, NULL, '2025-08-07 06:40:33', NULL, NULL, '2025-08-07 06:40:03', '2025-08-07 06:40:33', 'paciente', NULL),
(38, 'Doctor Admin', 'doctor@test.com', '$2b$10$dg0iEiLpeQgd3xQvv0Dy9OHZb1usxBay5u4Dccx3FcQwOky1j1qr6', 0, 0, NULL, '2025-08-07 06:47:10', NULL, NULL, '2025-08-07 06:40:18', '2025-08-07 06:47:10', 'especialista', '2007'),
(39, 'Alonso Jimenez', 'alonso22@madisa.com', '$2b$10$fEaQp7iFudjqwawaPEU1hezkYAyUZbv.q6cYCRSidGOt.6zbRE70G', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 06:53:47', '2025-08-07 06:53:47', 'paciente', NULL),
(41, 'Alonso Jimenez', 'alonso111@madisa.com', '$2b$10$7vguXmIao21IxkXmMpPnPuHLueDYFSpjwlRWkdTuGRMifR5h9iD7a', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 23:35:33', '2025-08-07 23:35:33', 'paciente', NULL),
(43, 'Alonso Jimenez', 'alonso99@madisa.com', '$2b$10$YVezE3qxreozBF87puij3eOyvKPA8UVbI0SHv39Ie9XMk6Pyf9Vku', 0, 0, NULL, NULL, NULL, NULL, '2025-08-07 23:56:26', '2025-08-07 23:56:26', 'paciente', NULL),
(45, 'Alonso Jimenez', 'alonso551@madisa.com', '$2b$10$6jXJzTtPc.pUl/RV5ilHu.fS8j83Poi2ZV52YgYu7DfUR2RtUOP4m', 0, 0, NULL, NULL, NULL, NULL, '2025-08-08 00:03:21', '2025-08-08 00:03:21', 'paciente', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `receta`
--
ALTER TABLE `receta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `citaId` (`citaId`);

--
-- Indices de la tabla `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `receta`
--
ALTER TABLE `receta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `receta`
--
ALTER TABLE `receta`
  ADD CONSTRAINT `receta_ibfk_1` FOREIGN KEY (`citaId`) REFERENCES `cita` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
