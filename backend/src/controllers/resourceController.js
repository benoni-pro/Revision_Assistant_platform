import Resource from '../models/Resource.js';

// @desc    Get all resources with filters and search
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const {
      search,
      subject,
      type,
      level,
      category,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = { isPublic: true };

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by subject
    if (subject) {
      query.subject = new RegExp(subject, 'i');
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by level
    if (level) {
      query.level = { $in: [level, 'all'] };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: {
        docs: resources,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources'
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName avatar email')
      .populate('ratings.user', 'firstName lastName avatar');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    await resource.incrementView();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource'
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private
export const createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      uploadedBy: req.user._id
    };

    const resource = await Resource.create(resourceData);
    await resource.populate('uploadedBy', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create resource'
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the owner
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update resource'
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the owner
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource'
    });
  }
};

// @desc    Add rating to resource
// @route   POST /api/resources/:id/ratings
// @access  Private
export const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.addRating(req.user._id, rating, review);
    await resource.save();
    await resource.populate('ratings.user', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: resource
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add rating'
    });
  }
};

// @desc    Toggle bookmark
// @route   POST /api/resources/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const bookmarkIndex = resource.bookmarks.indexOf(req.user._id);

    if (bookmarkIndex > -1) {
      resource.bookmarks.splice(bookmarkIndex, 1);
    } else {
      resource.bookmarks.push(req.user._id);
    }

    await resource.save();

    res.json({
      success: true,
      message: bookmarkIndex > -1 ? 'Bookmark removed' : 'Bookmark added',
      data: { isBookmarked: bookmarkIndex === -1 }
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark'
    });
  }
};

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Private
export const recordDownload = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.incrementDownload();

    res.json({
      success: true,
      message: 'Download recorded'
    });
  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record download'
    });
  }
};
