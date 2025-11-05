import express from 'express'

const router = express.Router();

router.get('/', (req, res) => {
    const occasions = [
        { id: 1, description: 'Birthday' },
        { id: 2, description: 'Anniversary' },
        { id: 3, description: 'Graduation' }
    ];
    res.json(occasions);
})

router.get('/:id', (req,res) => {
    const id = req.params.id;
    res.send(`Occasion details for occasion id: ${id}`);

    const occasion = { id: id, description: 'Sample Occasion' };
    res.json(occasion);
    
})

export default router;