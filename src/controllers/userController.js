const User = require('../models/User');
const Project = require('../models/Project');
const Repo = require('../models/Repo');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // 1. Userga tegishli projectlarni o‘chirish
    await Project.deleteMany({ owner: req.user._id });

    // 2. User hamkor bo‘lgan projectlardan o‘chirish
    await Project.updateMany(
      {},
      { $pull: { collaborators: req.user._id } }
    );

    // 3. Userga tegishli repositorylarni o‘chirish
    await Repo.deleteMany({ owner: req.user._id });

    // 4. Userni o‘chirish
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};