// ============================================
// PRODUCT DATA FILE - EDIT THIS FILE TO ADD/MODIFY PRODUCTS
// ============================================
// Structure:
// {
//     category: "Category Name",
//     subcategory: "Subcategory Name",  // Use if only one subcategory
//     products: ["Product 1", "Product 2"]
// }
// OR for multiple subcategories:
// {
//     category: "Category Name",
//     subcategories: [
//         { name: "Subcategory 1", products: ["Product A", "Product B"] },
//         { name: "Subcategory 2", products: ["Product C", "Product D"] }
//     ]
// }

const products = [
    {
        category: "Biscuits",
        subcategory: "Parle",
        products: [
            "Parle-G 100g",
            "Parle-G 250g",
            "Parle-G 500g",
            "Parle-G Gold 250g",
            "Hide & Seek 100g",
            "Hide & Seek 250g",
            "Monaco 100g",
            "Krackjack 100g"
        ]
    },
    {
        category: "Biscuits",
        subcategory: "Britannia",
        products: [
            "Marie Gold 100g",
            "Marie Gold 250g",
            "Good Day 100g",
            "Good Day 250g",
            "Milk Bikis 100g",
            "Milk Bikis 250g",
            "NutriChoice 100g",
            "Tiger 100g"
        ]
    },
    {
        category: "Namkeen",
        subcategory: "Haldiram",
        products: [
            "Aloo Bhujia 200g",
            "Aloo Bhujia 400g",
            "Mixture 200g",
            "Mixture 400g",
            "Khatta Meetha 200g",
            "Khatta Meetha 400g",
            "Bhujia Sev 200g",
            "Moong Dal 200g"
        ]
    },
    {
        category: "Namkeen",
        subcategory: "Bikaneri",
        products: [
            "Bhujia 200g",
            "Bhujia 400g",
            "Mixture 200g",
            "Sev 200g",
            "Ratlami Sev 200g",
            "Chivda 200g"
        ]
    },
    {
        category: "Beverages",
        subcategory: "Tea",
        products: [
            "Tata Tea 250g",
            "Tata Tea 500g",
            "Red Label 250g",
            "Red Label 500g",
            "Green Tea 100g",
            "Lipton 250g"
        ]
    },
    {
        category: "Beverages",
        subcategory: "Coffee",
        products: [
            "Nescafe 50g",
            "Nescafe 100g",
            "Nescafe 200g",
            "Bru 50g",
            "Bru 100g",
            "Bru 200g"
        ]
    },
    {
        category: "Cold Drinks",
        subcategory: "Coca Cola",
        products: [
            "Coca Cola 250ml",
            "Coca Cola 750ml",
            "Coca Cola 1.25L",
            "Coca Cola 2L",
            "Sprite 750ml",
            "Thums Up 750ml"
        ]
    },
    {
        category: "Cold Drinks",
        subcategory: "Pepsi",
        products: [
            "Pepsi 250ml",
            "Pepsi 750ml",
            "Pepsi 1.25L",
            "Pepsi 2L",
            "Mountain Dew 750ml",
            "7UP 750ml"
        ]
    },
    {
        category: "Dairy",
        subcategory: "Milk",
        products: [
            "Amul Milk 500ml",
            "Amul Milk 1L",
            "Amul Taaza 500ml",
            "Amul Taaza 1L",
            "Mother Dairy 500ml",
            "Mother Dairy 1L"
        ]
    },
    {
        category: "Dairy",
        subcategory: "Cheese",
        products: [
            "Amul Cheese 100g",
            "Amul Cheese 200g",
            "Britannia Cheese 100g",
            "Britannia Cheese 200g",
            "Go Cheese 100g",
            "Go Cheese 200g"
        ]
    },
    {
        category: "Spices",
        subcategory: "Whole Spices",
        products: [
            "Turmeric 100g",
            "Turmeric 200g",
            "Red Chilli 100g",
            "Red Chilli 200g",
            "Cumin 100g",
            "Cumin 200g",
            "Coriander 100g",
            "Coriander 200g"
        ]
    },
    {
        category: "Spices",
        subcategory: "Powdered Spices",
        products: [
            "Garam Masala 50g",
            "Garam Masala 100g",
            "Chaat Masala 50g",
            "Chaat Masala 100g",
            "Pav Bhaji Masala 50g",
            "Pav Bhaji Masala 100g"
        ]
    },
    {
        category: "Rice",
        subcategory: "Basmati",
        products: [
            "India Gate Basmati 1kg",
            "India Gate Basmati 5kg",
            "Daawat Basmati 1kg",
            "Daawat Basmati 5kg",
            "Fortune Basmati 1kg",
            "Fortune Basmati 5kg"
        ]
    },
    {
        category: "Rice",
        subcategory: "Non-Basmati",
        products: [
            "Sona Masoori 1kg",
            "Sona Masoori 5kg",
            "Ponni Rice 1kg",
            "Ponni Rice 5kg",
            "Brown Rice 1kg",
            "Brown Rice 5kg"
        ]
    },
    {
        category: "Atta & Flour",
        subcategory: "Wheat",
        products: [
            "Aashirvaad Atta 5kg",
            "Aashirvaad Atta 10kg",
            "Pillsbury Atta 5kg",
            "Pillsbury Atta 10kg",
            "Fortune Atta 5kg",
            "Fortune Atta 10kg"
        ]
    },
    {
        category: "Atta & Flour",
        subcategory: "Other Flours",
        products: [
            "Besan 500g",
            "Besan 1kg",
            "Maida 500g",
            "Maida 1kg",
            "Sooji 500g",
            "Sooji 1kg"
        ]
    },
    {
        category: "Oils",
        subcategory: "Sunflower",
        products: [
            "Fortune Sunflower 1L",
            "Fortune Sunflower 5L",
            "Saffola Sunflower 1L",
            "Saffola Sunflower 5L",
            "Gemini Sunflower 1L",
            "Gemini Sunflower 5L"
        ]
    },
    {
        category: "Oils",
        subcategory: "Mustard",
        products: [
            "Fortune Mustard 1L",
            "Fortune Mustard 5L",
            "Patanjali Mustard 1L",
            "Patanjali Mustard 5L",
            "Dhara Mustard 1L",
            "Dhara Mustard 5L"
        ]
    },
    {
        category: "Toiletries",
        subcategory: "Soap",
        products: [
            "Lifebuoy 100g",
            "Lifebuoy 150g",
            "Dettol 100g",
            "Dettol 150g",
            "Dove 100g",
            "Dove 150g",
            "Lux 100g",
            "Lux 150g"
        ]
    },
    {
        category: "Toiletries",
        subcategory: "Shampoo",
        products: [
            "Clinic Plus 100ml",
            "Clinic Plus 200ml",
            "Head & Shoulders 100ml",
            "Head & Shoulders 200ml",
            "Dove 100ml",
            "Dove 200ml",
            "Sunsilk 100ml",
            "Sunsilk 200ml"
        ]
    }
];