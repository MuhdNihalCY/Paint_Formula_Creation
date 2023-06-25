// Binder Calculations

var Sub_Category;
var Binder1_EQ;
var Binder2_EQ;
var Sum_qty;
var mattValue;
var gloss;
var total_PP;

var BinderError = false;
var err;



// Switch Case for the binder calculations based on sub category selected in dropdown menu

switch (Sub_Category) {
    case "Mipa_2K_PUR":
        Binder1_EQ = Sum_qty * mattValue;
        break;

    case "Mipa_BC":
        Binder1_EQ = Sum_qty * 0.2;
        break;

    case "Mipa_2K_PMI":
    case "PU_240_XX":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "Rosner_PU":
        Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 85 + total_PP;
        Binder2_EQ = (Sum_qty * 80 / 20) + total_PP - Binder1_EQ;
        break;

    case "Rosner_NC":
        Binder1_EQ = ((Sum_qty * 85 / 15 * gloss) - (10 * 88 / 15 * Sum_qty)) / 80 + total_PP;
        Binder2_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
        break;

    case "PU_250_XX":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "PU_248_90":
        Binder1_EQ = (Sum_qty * 67 / 33);
        break;

    case "PU_330_20":
        Binder1_EQ = Sum_qty * 9;
        break;

    case "BC_201_30":
        Binder1_EQ = Sum_qty * 3;
        break;

    case "PU_240_XX":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ
        break;

    case "EP_275_70":
        Binder1_EQ = (Sum_qty / 0.12 * 0.88);
        break;

    case "AK_232_90":
        Binder1_EQ = (Sum_qty / 0.25 * 0.73);
        Binder2_EQ = (Sum_qty / 0.25 * 0.02);
        break;

    case "EP_150_70":
        Binder1_EQ = Sum_qty * 9;
        break;

    case "Rosner_PU_Effects":
        Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 85;
        Binder2_EQ = (Sum_qty * 80 / 20) - Binder1_EQ;
        break;

    case "Rosner_NC_Effects":
        Binder1_EQ = ((Sum_qty * 85 / 15 * gloss) - (10 * 85 / 15 * Sum_qty)) / 80;
        Binder2_EQ = (Sum_qty * 85 / 15) - Binder1_EQ;
        break;

    case "Mipa_2K_PMI_Effects":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "Rosner_Acrylic":
    case "Rosner_Acrylic_Effects":
        Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
        Binder2_EQ = (Sum_qty * 80 / 20) - Binder1_EQ;
        break;

    case "BC_201_30_Effects":
        Binder1_EQ = Sum_qty * 3;
        break;

    case "EP_100_20":
        Binder1_EQ = Sum_qty * 9;
        break;

    case "EP_140_30":
        Binder1_EQ = Sum_qty * 85 / 15;
        break;

    case "VB_103_20":
        Binder1_EQ = Sum_qty * 4;
        break;

    case "WPU_2425_XX":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "Rosner_Treppenlack":
        Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
        Binder2_EQ = (Sum_qty * 4) - Binder1_EQ;
        break;

    case "WEP_1000_20":
        Binder1_EQ = Sum_qty * 9;
        break;

    case "Mipa_VIP":
        Binder1_EQ = Sum_qty * 9;
        break;

    case "WPU_4005_XX":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "WPU_8300_05":
        Binder1_EQ = Sum_qty * 4;
        break;

    case "WPA_2400_70":
        Binder1_EQ = Sum_qty * 3;
        break;

    case "WPU_2425_XX_Effects":
        Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
        Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
        break;

    case "Treppenlack_Effects":
        Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
        Binder2_EQ = (Sum_qty * 4) - Binder1_EQ;
        break;

    case "PU_100_20":
        Binder1_EQ = Sum_qty * 85 / 15;
        break;

    default:
        BinderError = true;
        err = "Binder Not Found!";
        break;
}







//using if statement

if (Sub_Category === "Mipa_2K_PUR") {
    Binder1_EQ = Sum_qty * mattValue;
} else if (Sub_Category === "Mipa_BC") {
    Binder1_EQ = Sum_qty * 0.2;
} else if (Sub_Category === "Mipa_2K_PMI" || Sub_Category === "PU_240_XX") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "Rosner_PU") {
    Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 85 + total_PP;
    Binder2_EQ = (Sum_qty * 80 / 20) + total_PP - Binder1_EQ;
} else if (Sub_Category === "Rosner_NC") {
    Binder1_EQ = ((Sum_qty * 85 / 15 * gloss) - (10 * 88 / 15 * Sum_qty)) / 80 + total_PP;
    Binder2_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
} else if (Sub_Category === "PU_250_XX") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "PU_248_90") {
    Binder1_EQ = (Sum_qty * 67 / 33);
} else if (Sub_Category === "PU_330_20") {
    Binder1_EQ = Sum_qty * 9;
} else if (Sub_Category === "BC_201_30") {
    Binder1_EQ = Sum_qty * 3;
} else if (Sub_Category === "PU_240_XX") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "EP_275_70") {
    Binder1_EQ = (Sum_qty / 0.12 * 0.88);
} else if (Sub_Category === "AK_232_90") {
    Binder1_EQ = (Sum_qty / 0.25 * 0.73);
    Binder2_EQ = (Sum_qty / 0.25 * 0.02);
} else if (Sub_Category === "EP_150_70") {
    Binder1_EQ = Sum_qty * 9;
} else if (Sub_Category === "Rosner_PU_Effects") {
    Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 85;
    Binder2_EQ = (Sum_qty * 80 / 20) - Binder1_EQ;
} else if (Sub_Category === "Rosner_NC_Effects") {
    Binder1_EQ = ((Sum_qty * 85 / 15 * gloss) - (10 * 85 / 15 * Sum_qty)) / 80;
    Binder2_EQ = (Sum_qty * 85 / 15) - Binder1_EQ;
} else if (Sub_Category === "Mipa_2K_PMI_Effects") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "Rosner_Acrylic_Effects") {
    Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
    Binder2_EQ = (Sum_qty * 80 / 20) - Binder1_EQ;
} else if (Sub_Category === "BC_201_30_Effects") {
    Binder1_EQ = Sum_qty * 3;
} else if (Sub_Category === "EP_100_20") {
    Binder1_EQ = Sum_qty * 9;
} else if (Sub_Category === "EP_140_30") {
    Binder1_EQ = Sum_qty * 85 / 15;
} else if (Sub_Category === "VB_103_20") {
    Binder1_EQ = Sum_qty * 4;
} else if (Sub_Category === "WPU_2425_XX") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "Rosner_Treppenlack") {
    Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
    Binder2_EQ = (Sum_qty * 4) - Binder1_EQ;
} else if (Sub_Category === "WEP_1000_20") {
    Binder1_EQ = Sum_qty * 9;
} else if (Sub_Category === "Mipa_VIP") {
    Binder1_EQ = Sum_qty * 9;
} else if (Sub_Category === "WPU_4005_XX") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (10 * 3 * Sum_qty)) / 80;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "WPU_8300_05") {
    Binder1_EQ = Sum_qty * 4;
} else if (Sub_Category === "WPA_2400_70") {
    Binder1_EQ = Sum_qty * 3;
} else if (Sub_Category === "WPU_2425_XX_Effects") {
    Binder1_EQ = ((Sum_qty * 3 * gloss) - (5 * 3 * Sum_qty)) / 85;
    Binder2_EQ = (Sum_qty * 3) - Binder1_EQ;
} else if (Sub_Category === "Treppenlack_Effects") {
    Binder1_EQ = ((Sum_qty * 80 / 20 * gloss) - (5 * 80 / 20 * Sum_qty)) / 65;
    Binder2_EQ = (Sum_qty * 4) - Binder1_EQ;
} else if (Sub_Category === "PU_100_20") {
    Binder1_EQ = Sum_qty * 85 / 15;
} else {
    BinderError = true;
    err = "Binder Not Found!";
}





// powder Pigment Equations

var PP_Qty


if (product === "M100 Powder Pigment" || product === "M120 Powder Pigment" || product === "M200 Powder Pigment" || product === "M210 Powder Pigment" || product === "M300 Powder Pigment" || product === "M310 Powder Pigment" || product === "M400 Powder Pigment" || product === "M600 Powder Pigment" || product === "M900 Powder Pigment" || product === "M910 Powder Pigment" || product === "M920 Powder Pigment") {
    PP_Qty = Product_Qty * 4;
} else {
    PP_Qty = 0;
}


var formula = {
    "_id": { "$oid": "649870b7d8c92051fb9ac649" },
    "MixerName": "Nihal",
    "Date": "2023-06-25",
    "FileNo": "10000",
    "ProjectNo": "436546",
    "CustomerName": "Hisadf",
    "CustomerRef": "asdfsa",
    "ColorCode": "sdfs",
    "ColorName": "ewrf",
    "Category": "100",
    "SubCategory": "1000",
    "TintersR1": "10005",
    "GramInputTotalR1": "30",
    "LiterInputTotalR1": "31.199950080079873",
    "TintersR2": "10001",
    "GramInputTotalR2": "50",
    "LiterInputTotalR2": "51.99991680013312",
    "TintersR3": "10000",
    "GramInputTotalR3": "5",
    "LiterInputTotalR3": "5.199991680013312",
    "TintersR4": "", "GramInputTotalR4": "0.00",
    "LiterInputTotalR4": "0.00",
    "TotalWithoutAdditves": "85",
    "matt": "20", "Binder1": "1700",
    "Binder2": "", "additives": "1002",
    "AdditivePercentage": "2",
    "TotalAdditives": "35.7",
    "TotalQtyInGram": "1820.7",
    "SolidContent": "56.199999999999996",
    "VOC": "421.15452",
    "Density": "961.54",
    "SampleQty": "30/31.199950080079873",
    "Remark": "Mixing with 50% Mipa 2K MS Hardener and 25 - 40 % Mipa 2K Thinner",
    "AdditiveRatio": { "$numberDouble": "0.0196078431372549" },
    "Binder1Ratio": { "$numberDouble": "0.9337068160597572" },
    "Binder2Ratio": { "$numberInt": "0" },
    "TintersRatioObject": { "1": { "$numberDouble": "0.01647717910693689" }, "2": { "$numberDouble": "0.027461965178228152" }, "3": { "$numberDouble": "0.0027461965178228152" } },
    "TintersRatioArray": [{ "$numberDouble": "0.01647717910693689" }, { "$numberDouble": "0.027461965178228152" }, { "$numberDouble": "0.0027461965178228152" }],
    "TintersCount": { "$numberInt": "3" },
    "InsertedTime": { "$numberDouble": "1687711926127.0" },
    "CategoryName": "Paints",
    "SubCategoryName": "Mipa_2K_PUR",
    "TinterNameR1": "PUR 42",
    "TinterNameR2": "PUR 6",
    "TinterNameR3": "PUR 5",
    "AdditiveName": "Str-Add fein",
    "Binder1Name": "Multi-mat"
}