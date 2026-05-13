function clean(html) {

  if (!html) return null;

  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/\t/g, '')
    .trim();
}

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {

    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        error: 'id é obrigatório'
      });
    }

    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&l=brazilian&cc=BR`
    );

    const data = await response.json();

    const game = data[id]?.data;

    if (!game) {
      return res.status(404).json({
        error: 'Jogo não encontrado'
      });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=86400'
    );

    res.status(200).json({

      // NOME
      name: game.name,

      // DESCRIÇÕES
      description:
        game.short_description,

      short_description:
        game.short_description,

      // TEXTO LIMPO
      detailed_description:
        clean(game.detailed_description),

      about_the_game:
        clean(game.about_the_game),

      // HTML ORIGINAL DA STEAM
      detailed_description_raw:
        game.detailed_description,

      about_the_game_raw:
        game.about_the_game,

      // IMAGENS
      capsule_image:
        game.capsule_image,

      capsule_imagev5:
        game.capsule_imagev5,

      background:
        game.background,

      background_raw:
        game.background_raw,

      // SCREENSHOTS
      screenshots: game.screenshots?.map(s => ({
        id: s.id,
        thumbnail: s.path_thumbnail,
        full: s.path_full
      })) || [],

      // TRAILERS
      movies: game.movies?.map(m => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        mp4: m.mp4,
        webm: m.webm,
        highlight: m.highlight
      })) || [],

      // GÊNEROS COMPLETOS
      genres_full:
        game.genres || [],

      // PREÇO COMPLETO
      price_full:
        game.price_overview || null,

      // REQUISITOS PC
      pc_requirements: {

        minimum_raw:
          game.pc_requirements?.minimum || null,

        recommended_raw:
          game.pc_requirements?.recommended || null,

        minimum:
          clean(game.pc_requirements?.minimum),

        recommended:
          clean(game.pc_requirements?.recommended)
      },

      // PACOTES
      packages:
        game.packages || [],

      package_groups:
        game.package_groups || []

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

}
