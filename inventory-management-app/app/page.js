'use client'; // Add this directive at the top

import React, { useState, useEffect, Fragment } from 'react';
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from 'firebase/firestore';
import { Box, Modal, Typography, Stack, TextField, Button, Chip, createTheme, ThemeProvider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios'; // Ensure axios is imported
import { firestore } from '@/firebase';

// Dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
    primary: {
      main: '#bb86fc',
    },
    secondary: {
      main: '#03dac6',
    },
  },
});

const apiKey = 'AIzaSyBkMQi8oMFiI2YrjcXs9e0BQUffTS6b5lI';

const schema = Yup.object().shape({
  ingredient: Yup.string().required('This field is required.'),
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Home() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      ingredient: '',
    },
    resolver: yupResolver(schema),
  });

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [recipeResult, setRecipeResult] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddOrRemoveItem = (item) => {
    setSelectedIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
//hi
  const generateRecipeHandler = async (e) => {
    e.preventDefault();
    setRecipeResult('Loading your recipe... \n It might take up to 10 seconds');
  
    const ingredients = selectedIngredients.map((str) => str.trim());
  
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        method: 'post',
        data: {
          contents: [{ parts: [{ text: `Generate a short and easy recipe of Pakistani food with only the selected ingredients and if no ingredients are selected return please select ingredients, with step by step instructions with each step in diffrent line and only using these ingredients: ${ingredients.join(', ')}` }] }],
        },
      });
  
      setRecipeResult(
        response.data.candidates[0].content.parts[0].text
      );
    } catch (error) {
      console.log(error);
      setRecipeResult('Sorry - Something went wrong. Please try again!');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Fragment>
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          justifyContent="center"
          flexDirection="column"
          alignItems="center"
          gap={4}
          padding={3}
          bgcolor="background.default"
        >
          <Typography variant="h3" mb={2} fontWeight="bold" color="text.primary">
            Inventory Management
          </Typography>
          <Stack spacing={2} alignItems="center" mb={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              sx={{ px: 3, py: 1.5, fontSize: '1rem', borderRadius: 2 }}
            >
              Add New Item
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={generateRecipeHandler}
              sx={{ px: 3, py: 1.5, fontSize: '1rem', borderRadius: 2 }}
            >
              Generate Recipe
            </Button>
          </Stack>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
                Add Item
              </Typography>
              <form onSubmit={handleSubmit(({ ingredient }) => addItem(ingredient))}>
                <Stack width="100%" direction="row" spacing={2}>
                  <Controller
                    name="ingredient"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="outlined-basic"
                        label="Item"
                        variant="outlined"
                        fullWidth
                        helperText={errors.ingredient?.message}
                        error={!!errors.ingredient}
                      />
                    )}
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2 }}>
                    Add
                  </Button>
                </Stack>
              </form>
            </Box>
          </Modal>
          <Box border="1px solid #333" borderRadius={2} overflow="hidden" boxShadow={1} mt={4}>
            <Box
              width="800px"
              height="100px"
              bgcolor="#333"
              display="flex"
              justifyContent="center"
              alignItems="center"
              padding={2}
            >
              <Typography variant="h5" color="text.primary" fontWeight="bold" textAlign="center">
                Inventory Items
              </Typography>
            </Box>
            <Stack
              width="800px"
              maxHeight="300px"
              spacing={2}
              overflow="auto"
              padding={2}
              sx={{ backgroundColor: '#1e1e1e' }}
            >
              {inventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="80px"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#2c2c2c"
                  paddingX={3}
                  paddingY={2}
                  borderRadius={2}
                  boxShadow={1}
                  sx={{ transition: 'background-color 0.3s', '&:hover': { backgroundColor: '#3c3c3c' } }}
                >
                  <Typography variant="h6" color="text.primary" textAlign="center" fontWeight="bold">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h6" color="text.primary" textAlign="center">
                    Quantity: {quantity}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="secondary" onClick={() => removeItem(name)} sx={{ borderRadius: 2 }}>
                      Remove
                    </Button>
                    <Button
                      variant="outlined"
                      color={selectedIngredients.includes(name) ? 'secondary' : 'primary'}
                      onClick={() => handleAddOrRemoveItem(name)}
                      sx={{ borderRadius: 2 }}
                    >
                      {selectedIngredients.includes(name) ? 'Deselect' : 'Select'}
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box marginTop={4}>
            <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
              Selected Ingredients
            </Typography>
            <Box
              width="800px"
              maxHeight="300px"
              border="1px solid #333"
              borderRadius={2}
              overflow="auto"
              padding={2}
              sx={{ backgroundColor: '#1e1e1e' }}
            >
              {selectedIngredients.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onDelete={() => handleAddOrRemoveItem(item)}
                  sx={{ margin: 0.5, backgroundColor: '#333', color: 'text.primary' }}
                />
              ))}
            </Box>
          </Box>
          {recipeResult && (
            <Box marginTop={4} padding={2} border="1px solid #333" borderRadius={2} bgcolor="#1e1e1e" boxShadow={1} position="fixed" bottom={16} right={16} width={300}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Generated Recipe
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={2}>
                {recipeResult}
              </Typography>
            </Box>
          )}
        </Box>
      </Fragment>
    </ThemeProvider>
  );
}

export default Home;