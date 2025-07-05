const News = require('./news.model');
const NewsMetadata = require('./news.mongo.model');

exports.getAllNews = async (req, res) => {
  const news = await News.findAll();
  res.json(news);
};

exports.getNewsById = async (req, res) => {
  const news = await News.findByPk(req.params.id);
  if (!news) return res.status(404).json({ error: 'News not found' });
  res.json(news);
};

exports.createNews = async (req, res) => {
  const { title, content, imageUrl, date } = req.body;

  const created = await News.create({ title, content, imageUrl, date });
  await NewsMetadata.create({
    postgresId: created.id.toString(),
    title,
    content,
    imageUrl,
    date,
  });

  res.status(201).json(created);
};

exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, imageUrl, date } = req.body;

  const news = await News.findByPk(id);
  if (!news) return res.status(404).json({ error: 'News not found' });

  await news.update({ title, content, imageUrl, date });
  await NewsMetadata.findOneAndUpdate({ postgresId: id }, {
    title,
    content,
    imageUrl,
    date,
  });

  res.json(news);
};

exports.deleteNews = async (req, res) => {
  const { id } = req.params;

  const news = await News.findByPk(id);
  if (!news) return res.status(404).json({ error: 'News not found' });

  await news.destroy();
  await NewsMetadata.findOneAndDelete({ postgresId: id });

  res.json({ message: 'Deleted successfully' });
};
