import express from 'express'
import sql from 'mssql'
import 'dotenv/config'

const router = express.Router();

const dbConnectionString = process.env.DB_CONNECTION_STRING;

//Get: /api/occasions
router.get('/', async (req, res) => {

    await sql.connect(dbConnectionString);

    const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Filename, a.CreatedAt, b.CategoryId, b.Name 
        from [dbo].[Occasion] a 
        INNER JOIN [dbo].[Category] b 
        ON a.CategoryId = b.CategoryId 
        ORDER BY a.[CreatedAt] DESC`;
        
    console.dir(result);
    res.json(result.recordset);
})


//Post: /api/occasions/comments
router.post('/comments', async (req, res) => {
    const comment = req.body;
    await sql.connect(dbConnectionString);

    const result = await sql.query`INSERT INTO [dbo].[Comment] (Body, Author, CreateDate, OccasionId) 
        VALUES (${comment.body}, ${comment.author}, ${comment.createDate}, ${comment.occasionId})`;
    
    res.json({message: 'Comment created'});

});

//Post: /api/occasions/purchases
router.post('/purchases', async (req, res) => {
    const purchase = req.body;
    await sql.connect(dbConnectionString);

    const result = await sql.query`INSERT INTO [dbo].[Purchase] (NumTicketsOrdered, CustomerFirstName, CustomerLastName, CustomerEmail, CustomerPhone, CustomerAddress, CreditCardNumber, CreditCardExpiry, CreditCardCvv, PurchaseDate, OccasionId) 
        VALUES (${purchase.numTicketsOrdered}, ${purchase.customerFirstName}, ${purchase.customerLastName}, ${purchase.customerEmail}, ${purchase.customerPhone}, ${purchase.customerAddress}, ${purchase.creditCardNumber}, ${purchase.creditCardExpiry}, ${purchase.creditCardCvv}, ${purchase.purchaseDate}, ${purchase.occasionId})`;
    
    res.json({message: 'Purchase created'});

});

//Get: /api/occasions/purchases
router.get('/purchases', async (req, res) => {

    await sql.connect(dbConnectionString);

    const result = await sql.query`SELECT a.NumTicketsOrdered, a.CustomerFirstName, a.CustomerLastName, a.CustomerEmail, a.CustomerPhone, a.CustomerAddress, a.CreditCardNumber, a.CreditCardExpiry, a.CreditCardCvv, a.PurchaseDate, a.OccasionId 
        FROM [dbo].[Purchase] a`;
    
    console.dir(result);
    res.json(result.recordset);

});

//Get: /api/occasions/:id
router.get('/:id', async (req,res) => {
    const id = req.params.id;

    await sql.connect(dbConnectionString);
    const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Filename, a.CreatedAt, b.CategoryId, b.Name 
        from [dbo].[Occasion] a 
        INNER JOIN [dbo].[Category] b 
        ON a.CategoryId = b.CategoryId 
        WHERE a.OccasionId = ${id}`;
        
    console.dir(result);

    if (result.recordset.length === 0) {
        res.status(404).send('Occasion not found');
    } else {
        res.json(result.recordset);
    }    
});


export default router;