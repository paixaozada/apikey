export default async function handler(req, res) {
  // CORS — permite seu site chamar a API
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const id = req.query.id;

    if (!id) return res.status(400).json({ error: 'id é obrigatório' });

    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&l=brazilian&cc=BR`
    );
    const data = await response.json();
    const game = data[id]?.data;

    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).json({
      title: game.name,
      description: game.short_description,
      banner: game.header_image,
      screenshots: game.screenshots?.map(s => s.path_full),
      genres: game.genres?.map(g => g.description),
      price: game.price_overview?.final_formatted,
      discount: game.price_overview?.discount_percent,
      price_original: game.price_overview?.initial_formatted,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}