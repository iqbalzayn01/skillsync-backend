// kegiatan
const Events = require('../../api/v1/events/model');
const { BadRequestError, NotFoundError } = require('../../errors');
const { checkingImage } = require('./images');

const createEvents = async (req, res) => {
  const {
    name,
    description,
    event_status,
    location,
    price,
    linkMeeting,
    imageID,
  } = req.body;

  await checkingImage(imageID);

  if (!name && !description && !event_status) {
    throw new BadRequestError(
      'Nama, deskripsi, status, dan gambar kegiatan harus diisi'
    );
  }

  const result = await Events.create({
    name,
    description,
    event_status,
    location,
    price,
    linkMeeting,
    imageID,
  });

  return result;
};

const getAllEvents = async (req) => {
  const { keyword, imageID } = req.query;
  let condition = {};

  if (keyword) {
    condition = { ...condition, title: { $regex: keyword, $options: 'i' } };
  }

  if (imageID) {
    condition = { ...condition, imageID: imageID };
  }

  const result = await Events.find(condition).populate({
    path: 'imageID',
    select: '_id fileName',
  });

  return result;
};

const getOneEvents = async (req) => {
  const { id } = req.params;

  const result = await Events.findOne({ _id: id }).populate({
    path: 'imageID',
    select: '_id fileName',
  });

  if (!result) throw new NotFoundError(`Tidak ada kegiatan dengan id :  ${id}`);

  return result;
};

const updateEvents = async (req) => {
  const { id } = req.params;
  const { name, description, event_status, location, price, linkMeeting } =
    req.body;

  const check = await Events.findOne({
    name,
    description,
    event_status,
    location,
    price,
    linkMeeting,
    _id: { $ne: id },
  });

  if (check) throw new BadRequestError('Kegiatan sudah terdaftar');

  const result = await Events.findOneAndUpdate(
    { _id: id },
    {
      name,
      description,
      event_status,
      location,
      price,
      linkMeeting,
    },
    { new: true, runValidators: true }
  );

  if (!result) throw new NotFoundError(`Tidak ada kegiatan dengan id :  ${id}`);

  return result;
};

const deleteEvents = async (req) => {
  const { id } = req.params;

  const result = await Events.findOne({ _id: id });

  if (!result) throw new NotFoundError(`Tidak ada kegiatan dengan id :  ${id}`);

  await result.deleteOne({ _id: id });

  return result;
};

const checkingEvents = async (id) => {
  const result = await Events.findOne({ _id: id });

  if (!result) throw new NotFoundError(`Tidak ada kegiatan dengan id :  ${id}`);

  return result;
};

module.exports = {
  createEvents,
  getAllEvents,
  getOneEvents,
  updateEvents,
  deleteEvents,
  checkingEvents,
};
