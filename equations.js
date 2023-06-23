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
}else{
    PP_Qty = 0;
}