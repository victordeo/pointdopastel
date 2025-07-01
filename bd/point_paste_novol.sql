-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 01-Jul-2025 às 12:52
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `point_pastel`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `admin`
--

INSERT INTO `admin` (`id`, `usuario`, `senha_hash`) VALUES
(3, 'admin', '$2b$10$JYtCk2dZEMhQbpeFzhjbue5cemKWreNnvJ5tfa9DhnqAOlYCyCDsW');

-- --------------------------------------------------------

--
-- Estrutura da tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `slug` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `slug`) VALUES
(1, 'Queijo', 'qj'),
(2, 'Frango', 'fr'),
(3, 'Calabresa', 'clb'),
(4, 'Presunto', 'pr'),
(5, 'Carne', 'car'),
(6, 'Light', 'lg'),
(7, 'Point Kids', 'pk'),
(8, 'Doces', 'dc'),
(9, 'Bebidas', 'bbd');

-- --------------------------------------------------------

--
-- Estrutura da tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `rua` varchar(100) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `cidade` varchar(50) DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `itens_pedido`
--

CREATE TABLE `itens_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `preco_unitario` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `tipo` enum('delivery','balcao') NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pendente','cancelado','preparando','pronto','entregue') DEFAULT 'pendente',
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `categoria_id` int(11) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `ativo`, `categoria_id`, `imagem`) VALUES
(2, 'Queijo mussarela', '<br>', 12.00, 1, 1, '1751338171475-queijo.png'),
(3, 'Queijo minas', '<br>', 12.00, 1, 1, '1751338157220-queijo.png'),
(4, 'Alho', 'Mussarela com alho', 13.00, 1, 1, '1751335245700-queijo.png'),
(5, 'Quatro queijos', 'Minas, mussarela, provolone e catupiry', 13.50, 1, 1, '1751335162603-queijo.png'),
(6, 'Palmito', 'Mussarela com palmito', 13.00, 1, 1, '1751335186259-queijo.png'),
(7, 'Bacon', 'Mussarela com bacon', 13.50, 1, 1, '1751335213899-queijo.png'),
(8, 'Frango', '<br>', 12.00, 1, 2, '1751335293250-frango.jpg'),
(9, 'Frango com catupiry', '<br>', 12.50, 1, 2, '1751335411111-frango.jpg'),
(10, 'Frango com mussarela', '<br>', 13.00, 1, 2, '1751335437715-frango.jpg'),
(11, 'Piu-piu', 'Frango, mussarela, ovo de codorna e azeitona', 13.50, 1, 2, '1751335498466-frango.jpg'),
(12, 'Mineiro', 'Frango, mussarela, milho, catupiry e ovo de codorna', 14.00, 1, 2, '1751335592943-frango.jpg'),
(13, 'Galinha caipira', 'Frango, mussarela, milho, ervilha, azeitona e ovo de cordorna', 14.00, 1, 2, '1751335636096-frango.jpg'),
(14, 'Golden', 'Frango, palmito e mussarela', 14.00, 1, 2, '1751335664594-frango.jpg'),
(15, 'Salada', 'Frango, mussarela, batata palha, presunto, milho e uva passas', 14.00, 1, 2, '1751335700497-frango.jpg'),
(16, 'Paulista', 'Frango, calabresa, cebola, orégano, azeitona e mussarela', 14.00, 1, 2, '1751335737994-frango.jpg'),
(17, 'Primavera', 'Frango, milho, ervilha, palmito e azeitona', 13.50, 1, 2, '1751335766841-frango.jpg'),
(18, 'Calabresa', 'Calabresa, mussarela e azeitona', 12.50, 1, 3, '1751335833271-calabresa.jpg'),
(19, 'Beleza', 'Calabresa, mussarela, azeitona e tomate', 12.50, 1, 3, '1751335864049-calabresa.jpg'),
(20, 'Baiano', 'Calabresa, mussarela e molho de pimenta', 12.50, 1, 3, '1751335911811-calabresa.jpg'),
(21, 'Batalha', 'Calabresa, mussarela, milho, ervilha, azeitona e catupiry', 14.00, 1, 3, '1751335950589-calabresa.jpg'),
(22, 'Canadense', 'Calabresa, palmito, catupiry e provolone', 14.00, 1, 3, '1751335988183-calabresa.jpg'),
(23, 'Bravo', 'Calabresa, mussarela, alho torrado, cebola e ovo de codorna', 14.00, 1, 3, '1751336035730-calabresa.jpg'),
(24, 'Oficial', 'Calabresa, catupiry, tomate, cebola e batata palha', 13.00, 1, 3, '1751336087843-calabresa.jpg'),
(25, 'Misto', 'Mussarela, presunto e orégano', 12.50, 1, 4, '1751336224595-presunto.JPG'),
(26, 'Master', 'Mussarela, presunto, milho, palmito e azeitona', 14.00, 1, 4, '1751336272553-presunto.JPG'),
(27, 'Carioca', 'Mussarela, presunto, ovo de codorna, catupiry e bacon', 14.00, 1, 4, '1751336344240-presunto.JPG'),
(28, 'Pizza', 'Mussarela, presunto, tomate, azeitona, cebola e orégano', 13.50, 1, 4, '1751336450099-presunto.JPG'),
(29, 'Portuguesa', 'Mussarela, presunto, calabresa, ovo de cordona, azeitona, cebola e orégano', 14.00, 1, 4, '1751337833939-presunto.JPG'),
(30, 'Culpado', 'Mussarela, presunto, catupiry, milho, ervilha e ovo de codorna.', 13.50, 1, 4, '1751337877901-presunto.JPG'),
(31, 'Magnífico', 'Presunto, calabresa, catupiry, cebola e ovo de codorna', 13.50, 1, 4, '1751338012008-presunto.JPG'),
(32, 'Mistério', 'Mussarela, presunto, alho torrado, palmito e azeitona', 14.00, 1, 4, '1751338070725-presunto.JPG'),
(33, 'Supremo', 'Mussarela, presunto, batata palha, catupiry e milho', 14.00, 1, 4, '1751338228464-presunto.JPG'),
(34, 'Carne', '<br>', 12.00, 1, 5, '1751338255420-carne.jpg'),
(35, 'Carne com catupiry', '<br>', 12.50, 1, 5, '1751338272925-carne.jpg'),
(36, 'Carne com mussarela', '<br>', 13.00, 1, 5, '1751338295455-carne.jpg'),
(37, 'Oba', 'Carne, mussarela, cebola e azeitona', 14.00, 1, 5, '1751338324591-carne.jpg'),
(38, 'Delícia', 'Carne, mussarela, alho torrado e ovo de codorna', 14.00, 1, 5, '1751338360423-carne.jpg'),
(39, 'Frajola', 'Carne, ovo de codorna, azeitona, cebola e catupiry', 14.00, 1, 5, '1751338409639-carne.jpg'),
(40, 'Jóia', 'Carne, calabresa, mussarela, tomate e cebola', 14.00, 1, 5, '1751338442212-carne.jpg'),
(41, 'Bárbaro', 'Carne, catupiry e bacon', 15.00, 1, 5, '1751338516194-carne.jpg'),
(42, 'Romano', 'Carne, mussarela, ovo de codorna, palmito, cebola, orégano e azeitona', 14.00, 1, 5, '1751338570749-carne.jpg'),
(43, 'Vegetariano', 'Minas, tomate, cebola, milho, ervilha, azeitona e ovo de codorna', 13.50, 1, 6, '1751338692210-light.JPG'),
(44, 'Paraíso', 'Minas, presunto, azeitona, ovo de codorna, ervilha e milho', 13.50, 1, 6, '1751338736152-light.JPG'),
(45, 'Tropical', 'Frango, minas, catupiry, milho, ervilha e orégano', 13.50, 1, 6, '1751338800846-light.JPG'),
(46, 'Especial', 'Frango, alho torrado, catupiry, cebola, tomate, palmito, milho e ervilha', 14.00, 1, 6, '1751338864696-light.JPG'),
(47, 'Queijo minas(kids)', '<br>', 8.00, 1, 7, '1751338947237-kids.png'),
(48, 'Queijo mussarela(kids)', '<br>', 8.00, 1, 7, '1751338980103-kids.png'),
(49, 'Carne(kids)', '<br>', 7.00, 1, 7, '1751339005397-kids.png'),
(50, 'Frango(kids)', '<br>', 7.00, 1, 7, '1751339027378-kids.png'),
(51, 'Misto(kids)', 'Mussarela, presunto e orégano', 8.00, 1, 7, '1751339059547-kids.png'),
(52, 'Chocolate branco(kids)', '<br>', 9.00, 1, 7, '1751339093262-kids.png'),
(53, 'Chocolate ao leite(kids)', '<br>', 9.00, 1, 7, '1751339114850-kids.png'),
(54, 'Point(kids)', 'Chocolate ao leite, chocolate branco e coco ralado', 9.00, 1, 7, '1751339167400-kids.png'),
(55, 'Romeu e Juliete(kids)', 'Minas e goiaba', 8.00, 1, 7, '1751339192017-kids.png'),
(56, 'Água na boca(kids)', 'Chocolate ao leite e banana', 9.00, 1, 7, '1751339223537-kids.png'),
(57, 'Biju(kids)', 'Doce de leite, ameixa e coco ralado', 9.00, 1, 7, '1751339252981-kids.png'),
(58, 'Churros', 'Doce de leite com canela', 14.00, 1, 8, '1751339362817-doce.jpg'),
(59, 'Fabuloso', 'Doce de leite com paçoca', 14.00, 1, 8, '1751339387494-doce.jpg'),
(60, 'Banana', 'Banana, açúcar e canela', 12.00, 1, 8, '1751339414255-doce.jpg'),
(61, 'Água na boca', 'Banana com chocolate', 14.00, 1, 8, '1751339438878-doce.jpg'),
(62, 'Biju', 'Doce de leite, coco e ameixa', 14.00, 1, 8, '1751339459303-doce.jpg'),
(63, 'Chocolate preto', '<br>', 14.00, 1, 8, '1751339477355-doce.jpg'),
(64, 'Chocolate branco', '<br>', 17.00, 1, 8, '1751339498143-doce.jpg'),
(65, 'Morango', 'Morango com chocolate', 14.00, 1, 8, '1751339518159-doce.jpg'),
(66, 'Point', 'Chocolate ao leite, chocolate branco e coco ralado', 14.00, 1, 8, '1751339546362-doce.jpg'),
(67, 'Romeu e Julieta', 'Minas e goiaba', 13.00, 1, 8, '1751339571639-doce.jpg'),
(68, 'Serenata', 'Chocolate ao leite com bombom serenata', 14.50, 1, 8, '1751339607656-doce.jpg'),
(69, 'Kit kat', 'Chocolate com Kit kat', 14.50, 1, 8, '1751339630967-doce.jpg'),
(70, 'Moreno', 'Chocolate com amendoim', 14.00, 1, 8, '1751339648600-doce.jpg'),
(71, 'Pecado', 'Banana, leite condensado, mussarela, açúcar e canela', 13.00, 1, 8, '1751339685395-doce.jpg'),
(72, 'Confete', 'Chocolate preto e confete', 14.50, 1, 8, '1751339716779-doce.jpg'),
(73, 'Carinhoso', 'Banana, minas e doce de leite', 14.00, 1, 8, '1751339757662-doce.jpg'),
(74, 'Dois irmãos', 'Goiabada com catupiry', 13.00, 1, 8, '1751339807332-doce.jpg'),
(75, 'Amor a dois', 'Chocolate com ovomaltine', 15.00, 1, 8, '1751339875619-doce.jpg'),
(76, 'Devastador', 'Banana, ovomaltine e leite ninho', 13.50, 1, 8, '1751339931797-doce.jpg'),
(77, 'Perdão', 'Banana, ovomaltine, mussarela e leite ninho', 14.00, 1, 8, '1751339968064-doce.jpg'),
(78, 'Caribe', 'Banana com doce de leite', 14.00, 1, 8, '1751339990578-doce.jpg'),
(79, 'Sensação', 'Morango com doce de leite', 14.00, 1, 8, '1751340028617-doce.jpg'),
(80, 'Sonho', 'Doce de leite, ovomaltine e banana', 14.00, 1, 8, '1751340052646-doce.jpg'),
(81, 'Divino', 'Chocolate, amendoim e ovomaltine', 14.50, 1, 8, '1751340083371-doce.jpg'),
(82, 'Coca-cola lata 350ml', '<br>', 6.00, 1, 9, '1751340228448-cocalata.jpg'),
(83, 'Coca-cola zero 350ml', '<br>', 6.00, 1, 9, '1751340285025-cocazerolata.jpg'),
(84, 'Guaraná Antarctica 350ml', '<br>', 6.00, 1, 9, '1751340311761-guaranalata.jpg'),
(85, 'Fanta uva 350ml', '<br>', 6.00, 1, 9, '1751340340865-fantauvalata.jpg'),
(86, 'Fanta laranja 350ml', '<br>', 6.00, 1, 9, '1751340364314-fantalaralata.jpg'),
(87, 'Guaravita', '<br>', 2.50, 1, 9, '1751340381762-guaravita.png'),
(88, 'Água sem gás', '<br>', 2.50, 1, 9, '1751340462466-aguasg.png'),
(89, 'Água com gás', '<br>', 3.00, 1, 9, '1751340496826-aguacg.png'),
(90, 'H2OH! limoneto', '<br>', 7.00, 1, 9, '1751340520154-limoneto.png'),
(91, 'Coca-cola 2l', '<br>', 15.00, 1, 9, '1751340560978-coca.png'),
(92, 'Coca-cola zero 1.5l', '<br>', 12.00, 1, 9, '1751340583696-cocazero.png'),
(93, 'Guaraná 1.5l', '<br>', 10.00, 1, 9, '1751340608714-guarana.png'),
(94, 'Del Valle 1.5l', '<br>', 10.00, 1, 9, '1751340634466-delvalle.png');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- Índices para tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices para tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices para tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Índices para tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD CONSTRAINT `itens_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `itens_pedido_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Limitadores para a tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);

--
-- Limitadores para a tabela `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
