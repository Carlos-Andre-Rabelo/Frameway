<?php
// api.php - Proxy para a API do TMDB

require_once 'config.php';

header('Content-Type: application/json');

// Pega o ID do filme da query string, com um padrão para "A Viagem de Chihiro"
$movieId = isset($_GET['movie_id']) ? intval($_GET['movie_id']) : 129;

if (!$movieId) {
    echo json_encode(['error' => 'ID do filme inválido.']);
    exit;
}

$apiKey = TMDB_API_KEY;
$apiUrl = "https://api.themoviedb.org/3/movie/{$movieId}?api_key={$apiKey}&language=pt-BR";

// Inicializa o cURL
$ch = curl_init();

// Configura as opções do cURL
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FAILONERROR, true); // Falha se o código HTTP for >= 400

// Executa a requisição
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Trata erros do cURL
if (curl_errno($ch)) {
    echo json_encode(['error' => 'Erro na requisição cURL: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Trata erros de resposta da API (ex: 401, 404)
if ($httpCode >= 400) {
    echo json_encode(['error' => 'A API do TMDB retornou um erro.', 'http_code' => $httpCode, 'response' => json_decode($response)]);
    curl_close($ch);
    exit;
}

// Fecha o cURL
curl_close($ch);

// Retorna a resposta da API diretamente para o cliente
echo $response;

?>