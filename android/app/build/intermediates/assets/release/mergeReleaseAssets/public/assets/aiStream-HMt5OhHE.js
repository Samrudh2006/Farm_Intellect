async function h({messages:r,mode:a="chat",imageBase64:i,imageMimeType:t,onDelta:c,onDone:d,onError:f}){var s;{let e="Welcome to Farm Intellect local helper! I can assist with crop advisory, disease scanning, and weather guidance.";if(a==="disease")e=`Based on the leaf scan, we detected **Cercospora Leaf Spot**.

**Remedy:**
1. Remove infected leaves.
2. Spray Neem oil or copper fungicide.
3. Avoid overhead watering to reduce moisture on leaves.`;else if(a==="recommendation")e=`I recommend **Wheat** or **Mustard** for your soil composition and the current winter season.

* Soil pH: 6.5
* Expected Water: Moderate
* Growth duration: 120-140 days`;else if(a==="yield")e="Predicted Yield: **4.5 Tons/Hectare** under normal weather conditions. This estimate is based on typical regional soil reports and historical yields.";else{const n=((s=r[r.length-1])==null?void 0:s.content.toLowerCase())||"";n.includes("wheat")||n.includes("गेहूं")?e="Wheat is a Rabi crop sown in winter. It requires well-drained loam soils and cool weather during the growing season. Maintain regular irrigation at critical stages.":n.includes("rice")||n.includes("धान")?e="Rice is a Kharif crop that requires clayey loam soil and standing water. Sow in June-July and harvest in November. Ensure consistent water levels.":(n.includes("scheme")||n.includes("योजना"))&&(e="You qualify for **PM-KISAN** (₹6,000/year direct transfer) and **PM Fasal Bima Yojana** (Crop insurance safety net). Contact local block office for enrollment.")}const l=e.split(" ");let o=0;const u=setInterval(()=>{o<l.length?(c(l[o]+" "),o++):(clearInterval(u),d())},40);return}}async function w({messages:r,mode:a="chat"}){let i="";return await h({messages:r,mode:a,onDelta:t=>{i+=t},onDone:()=>{},onError:t=>{throw new Error(t)}}),i}export{w as i,h as s};
