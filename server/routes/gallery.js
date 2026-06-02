const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// GET /api/gallery (Public)
router.get('/', async (req, res) => {
  try {
    let images = await Gallery.find().sort({ createdAt: -1 });

    if (images.length === 0) {
      const defaultImages = [
        { title: 'Weekly Food Donation Drive', imageUrl: 'images/pho1.jpg', description: 'Feeding nutritious cooked meals to underprivileged families in Coimbatore.' },
        { title: 'Emergency Blood Support Group', imageUrl: 'images/pho2.jpg', description: 'Saving critical lives by connecting voluntary donors on time.' },
        { title: 'Tree Plantation Event', imageUrl: 'images/pho3.jpg', description: 'Expanding green cover and creating cooling zones across local districts.' },
        { title: 'Sarvham Team Outreach', imageUrl: 'images/pho4.PNG', description: 'Our wonderful volunteers mobilizing relief support.' },
        { title: 'Nature Restoration Campaign', imageUrl: 'images/pho5.PNG', description: 'Planting saplings with active community involvement.' },
        { title: 'Compassionate Care Program', imageUrl: 'images/pho6.png', description: 'Spreading hope and kindness through localized action.' },
        { title: 'Green Earth Drive', imageUrl: 'images/pho7.png', description: 'Planting thousands of native trees for tomorrow.' }
      ];
      await Gallery.insertMany(defaultImages);
      images = await Gallery.find().sort({ createdAt: -1 });
    }

    res.json(images);
  } catch (err) {
    console.error('Error fetching gallery:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gallery (Admin protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, imageUrl, description } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and Image URL are required' });
    }

    const newImage = new Gallery({ title, imageUrl, description });
    const savedImage = await newImage.save();

    res.status(201).json(savedImage);
  } catch (err) {
    console.error('Error saving gallery item:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gallery/:id (Admin protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedImage = await Gallery.findByIdAndDelete(req.params.id);
    if (!deletedImage) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery item:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
