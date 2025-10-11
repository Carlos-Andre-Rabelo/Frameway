<?php
// api.php - Proxy aprimorado para a API do TMDB

require_once 'config.php';

header('Content-Type: application/json');

$apiKey = TMDB_API_KEY;
$baseUrl = 'https://api.themoviedb.org/3/movie/';
$params = "?api_key={$apiKey}&language=pt-BR&include_image_language=pt-BR,null"; // Prioriza português

$endpoint = '';
$response = null;

// Verifica qual tipo de dado está sendo solicitado
if (isset($_GET['movie_id'])) {
    $movieId = intval($_GET['movie_id']);
    if ($movieId) {
        $endpoint = $baseUrl . $movieId . $params;
    }
} elseif (isset($_GET['credits_for'])) {
    $movieId = intval($_GET['credits_for']);
    if ($movieId) {
        $endpoint = $baseUrl . $movieId . '/credits' . $params;
    }
} elseif (isset($_GET['related_to'])) {
    $movieId = intval($_GET['related_to']);
    if ($movieId) {
        $endpoint = $baseUrl . $movieId . '/recommendations' . $params; // Usando 'recommendations' para melhores resultados
    }
} elseif (isset($_GET['search'])) {
    $query = urlencode($_GET['search']);
    if (!empty($query)) {
        $endpoint = "https://api.themoviedb.org/3/search/movie{$params}&query={$query}";
    }
} elseif (isset($_GET['images_for'])) {
    $movieId = intval($_GET['images_for']);
    if ($movieId) {
        $endpoint = $baseUrl . $movieId . '/images' . "?api_key={$apiKey}"; // Não precisa de &language aqui
    }
} elseif (isset($_GET['videos_for'])) {
    $movieId = intval($_GET['videos_for']);
    if ($movieId) {
        // REMOVIDO o $params. Pedimos TODOS os vídeos e filtramos no lado do cliente.
        $endpoint = $baseUrl . $movieId . '/videos' . "?api_key={$apiKey}";
    }
} elseif (isset($_GET['download_image'])) {
    $imagePath = $_GET['download_image'];

    // Validação básica para segurança
    if (!empty($imagePath) && strpos($imagePath, '..') === false) {
        // O caminho da imagem já vem com a barra inicial, ex: /xyz.jpg
        $imageUrl = 'https://image.tmdb.org/t/p/original' . $imagePath;

        $ch = curl_init($imageUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $imageData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200 && $imageData) {
            // Determina o tipo de conteúdo (MIME type)
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            header('Content-Type: ' . $finfo->buffer($imageData));
            echo $imageData;
            exit; // Termina o script após enviar a imagem
        }
    }
}

// Se um endpoint válido foi definido, faz a requisição
if ($endpoint) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $response = json_encode(['error' => 'Erro na requisição cURL: ' . curl_error($ch)]);
        http_response_code(500);
    } elseif ($httpCode >= 400) {
        $response = json_encode(['error' => 'A API do TMDB retornou um erro.', 'http_code' => $httpCode, 'response' => json_decode($response)]);
        http_response_code($httpCode);
    }
    
    curl_close($ch);
} else {
    $response = json_encode(['error' => 'Requisição inválida. Especifique um dos seguintes: movie_id, credits_for, related_to, search, images_for, videos_for.']);
    http_response_code(400);
}

// Retorna a resposta
echo $response;

?>