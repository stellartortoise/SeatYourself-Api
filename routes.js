import express from 'express'
import sql from 'mssql'
import 'dotenv/config'

const router = express.Router();

const dbConnectionString = process.env.DB_CONNECTION_STRING;

// Luhn Algorythm
function luhnCheck(value) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

//Get: /api/occasions
router.get('/', async (req, res) => {

    await sql.connect(dbConnectionString);

    // const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Date, a.Time, a.Owner, a.Price, a.Filename, a.CreatedAt, b.CategoryId, b.Name 
    //     from [dbo].[Occasion] a 
    //     INNER JOIN [dbo].[Category] b 
    //     ON a.CategoryId = b.CategoryId 
    //     ORDER BY a.[CreatedAt] DESC`;
        const result = await sql.query`SELECT 
        a.OccasionId,
        a.Title,
        a.Description,
        a.Date,
        a.Time,
        a.Owner,
        a.Price,
        a.Filename,
        a.CreatedAt,
        b.CategoryId,
        b.Name,
        c.VenueId,       
        c.Location       
      FROM [dbo].[Occasion] a 
      INNER JOIN [dbo].[Category] b ON a.CategoryId = b.CategoryId 
      INNER JOIN [dbo].[Venue] c ON a.VenueId = c.VenueId
      ORDER BY a.[CreatedAt] DESC`;
        
        
    console.dir(result);
    res.json(result.recordset);
})

//Get: /api/occasions/comments
router.get('/comments', async (req, res) => {
    await sql.connect(dbConnectionString);

    const result = await sql.query`SELECT a.CommentId, a.Body, a.Author, a.CreateDatet, a.OccasionId 
        FROM [dbo].[Comment] a`;

    console.dir(result);
    res.json(result.recordset);
});

//Post: /api/occasions/comments
router.post('/comments', async (req, res) => { //was '/comments'
    const comment = req.body;
    await sql.connect(dbConnectionString);

    const result = await sql.query`INSERT INTO [dbo].[Comment] (Body, Author, CreateDatet, OccasionId) 
        VALUES (${comment.Body}, ${comment.Author}, GETDATE(), ${comment.OccasionId})`;
    
    res.json({message: 'Comment created'});

});

// POST: /api/occasions/purchases
router.post('/purchases', async (req, res) => {
  try {
    const purchase = req.body;
    await sql.connect(dbConnectionString);

    function Validate(status) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

      if (!purchase || !Number.isInteger(purchase.NumTicketsOrdered) || purchase.NumTicketsOrdered <= 0) {
        res.status(status).json({ message: 'Invalid number of tickets ordered' });
        return false;
      }

      if (!purchase.CustomerEmail || !emailRegex.test(purchase.CustomerEmail)) {
        res.status(status).json({ message: 'Invalid customer email format' });
        return false;
      }

      if (!purchase.CreditCardNumber || !/^\d{16}$/.test(String(purchase.CreditCardNumber)) || !luhnCheck(String(purchase.CreditCardNumber))) {
        res.status(status).json({ message: 'Invalid credit card number' });
        return false;
      }

      if (!purchase.CreditCardExpiry || !expiryRegex.test(purchase.CreditCardExpiry)) {
        res.status(status).json({ message: 'Invalid credit card expiry format' });
        return false;
      }

      if (!purchase.CreditCardCvv || !/^\d{3}$/.test(String(purchase.CreditCardCvv))) {
        res.status(status).json({ message: 'Invalid credit card CVV' });
        return false;
      }

      if (!purchase.OccasionId || isNaN(Number(purchase.OccasionId))) {
        res.status(status).json({ message: 'Invalid OccasionId' });
        return false;
      }

      return true;
    }

    // Stop here if validation failed (prevents double-send)
    if (!Validate(400)) return;

    // Perform insert using PascalCase properties
    await sql.query`
      INSERT INTO [dbo].[Purchase] (
        NumTicketsOrdered,
        CustomerFirstName,
        CustomerLastName,
        CustomerEmail,
        CustomerPhone,
        CustomerAddress,
        CreditCardNumber,
        CreditCardExpiry,
        CreditCardCvv,
        PurchaseDate,
        OccasionId
      ) VALUES (
        ${purchase.NumTicketsOrdered},
        ${purchase.CustomerFirstName},
        ${purchase.CustomerLastName},
        ${purchase.CustomerEmail},
        ${purchase.CustomerPhone},
        ${purchase.CustomerAddress},
        ${purchase.CreditCardNumber},
        ${purchase.CreditCardExpiry},
        ${purchase.CreditCardCvv},
        ${purchase.PurchaseDate},
        ${purchase.OccasionId}
      )
    `;

    res.status(201).json({ message: 'Purchase created' });
  } catch (err) {
    console.error('POST /purchases error:', err);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
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
    // const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Date, a.Time, a.Owner, a.Filename, a.CreatedAt, a.Price, b.CategoryId, b.Name 
    //     from [dbo].[Occasion] a 
    //     INNER JOIN [dbo].[Category] b 
    //     ON a.CategoryId = b.CategoryId 
    //     WHERE a.OccasionId = ${id}`;
            const result = await sql.query`SELECT 
        a.OccasionId,
        a.Title,
        a.Description,
        a.Date,
        a.Time,
        a.Owner,
        a.Price,
        a.Filename,
        a.CreatedAt,
        b.CategoryId,
        b.Name,
        c.VenueId,       
        c.Location       
      FROM [dbo].[Occasion] a 
      INNER JOIN [dbo].[Category] b ON a.CategoryId = b.CategoryId 
      INNER JOIN [dbo].[Venue] c ON a.VenueId = c.VenueId
      WHERE a.OccasionId = ${id}`;
    
    
        
    console.dir(result);

    if (result.recordset.length === 0) {
        res.status(404).send('Occasion not found');
    } else {
        res.json(result.recordset[0]);
    }    
});


export default router;