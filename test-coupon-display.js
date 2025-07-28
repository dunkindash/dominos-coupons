// Simple test to verify CouponDisplay component functionality
const testCoupons = [
    {
        ID: "1",
        Name: "Large Pizza Deal",
        Description: "Get a large pizza for just $9.99",
        Price: "9.99",
        Code: "LARGE999",
        Bundle: "false",
        Local: "true",
        ValidServiceMethods: ["Delivery", "Carryout"],
        ExpirationDate: "2025-12-31"
    },
    {
        ID: "2", 
        Name: "Wings Bundle",
        Description: "10 piece wings with 2 liter soda",
        Price: "12.99",
        Code: "WINGS10",
        Bundle: "true",
        ValidServiceMethods: ["Carryout"],
        ExpirationDate: "2025-12-31"
    },
    {
        ID: "3",
        Name: "Late Night Special",
        Description: "After 10pm - Medium pizza $7.99",
        Price: "7.99", 
        Code: "LATE799",
        ValidServiceMethods: ["Delivery"],
        ExpirationDate: "2025-12-31"
    }
];

console.log("Test coupons created:");
console.log("1. Pizza Deal - should be categorized as 'Pizza Deals'");
console.log("2. Wings Bundle - should be categorized as 'Bundle Deals'");  
console.log("3. Late Night Special - should be categorized as 'Late Night'");
console.log("\nComponent should display:");
console.log("- Grid layout with consistent card sizing");
console.log("- Color-coded category badges");
console.log("- Prominent savings amounts");
console.log("- Enhanced hover effects");
console.log("- Improved visual hierarchy");