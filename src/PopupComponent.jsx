import { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { firestore, storage } from './firebase';
import {
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

const StyledBox = styled(Box)(({ theme }) => ({
  '& > *': {
    margin: theme.spacing(1),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const PopupComponent = ({ location }) => {
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const docRef = doc(firestore, 'locations', location.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPhotos(docSnap.data().photos || []);
      } else {
        console.log('No such document!');
      }
    };

    fetchPhotos();
  }, [location.id]);

  const handleOpen = (img) => {
    setOpen(true);
    setSelectedImage(img);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(firestore, 'locations', location.id), {
      comments: arrayUnion({ text: comment }),
    });
    setComment('');
  };

  const handlePhotoDelete = async (photo) => {
    const storageRef = ref(
      storage,
      `locations/${location.id}/photos/${photo.name}`
    );
    await deleteObject(storageRef);

    await updateDoc(doc(firestore, 'locations', location.id), {
      photos: arrayRemove(photo),
    });

    setPhotos(photos.filter((p) => p !== photo));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file.size > 3000000) {
      // File size is larger than 3mb
      alert('File size should not exceed 3MB');
      return;
    }

    const storageRef = ref(storage);
    const fileRef = ref(
      storageRef,
      `locations/${location.id}/photos/${file.name}`
    );
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    const newPhoto = {
      path: photoURL,
      name: file.name,
    };

    await updateDoc(doc(firestore, 'locations', location.id), {
      photos: arrayUnion(newPhoto),
    });
    setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
    setPhoto(null);
  };

  return (
    <Popup>
      <StyledBox>
        <Typography variant="h5">{location.name}</Typography>
        <Typography variant="body1">{location.description}</Typography>
        <Typography variant="h6">Add Comment</Typography>
        <form onSubmit={handleCommentSubmit}>
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            required
          />
          <StyledButton variant="contained" color="primary" type="submit">
            Submit Comment
          </StyledButton>
        </form>
        <Typography variant="h6">Upload Photo</Typography>
        {/* ... other UI elements */}
        <ImageList variant="masonry" rowHeight={160} cols={3}>
          {photos.map((photo, index) => (
            <ImageListItem key={index}>
              <img
                src={photo.path}
                alt={photo.name}
                onClick={() => handleOpen(photo.path)}
              />
              <ImageListItemBar
                title={photo.name}
                actionIcon={
                  <IconButton onClick={() => handlePhotoDelete(photo)}>
                    <DeleteIcon color="secondary" />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
        {photos.length < 3 && (
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        )}

        {/* Modal for image display */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Carousel>
              {photos.map((photo, index) => (
                <div key={index}>
                  <img src={photo.path} alt={photo.name} />
                </div>
              ))}
            </Carousel>
          </DialogContent>
        </Dialog>
      </StyledBox>
    </Popup>
  );
};

export default PopupComponent;
