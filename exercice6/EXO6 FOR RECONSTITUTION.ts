function createColorBox(color) {
    const newDiv = document.createElement('div');
    newDiv.className = 'color-box';
    newDiv.style.backgroundColor = color;
    newDiv.style.width = '50px';
    newDiv.style.height = '50px';
    newDiv.style.display = 'inline-block';
    newDiv.style.margin = '5px';
    newDiv.style.cursor = 'pointer';
    palette.appendChild(newDiv); // Add the new div to the palette

    newDiv.className = 'color-box';
    newDiv.setAttribute('data-color', color);
    
    
    newDiv.addEventListener('click', function () {
        const select = newDiv.getAttribute('data-color');// Get the color from the clicked box
        selectedColor.textContent = `Couleur sélectionnée: ${select}`;
        selectedColor.style.backgroundColor = select; 
        
        const changeEvent = new CustomEvent('colorChanged', {
            detail: {
                color: select // Pass the selected color in the event detail
            }
        });
        
        selectedColor.dispatchEvent(changeEvent);
       
    });



    newDiv.addEventListener('mouseover', function () {
        const survol = newDiv.getAttribute('data-color');// Get the color from the clicked box
        colorInfo.textContent = `Couleur survolée: ${survol}`; 
    });

    newDiv.addEventListener('mouseout', function () {
        colorInfo.textContent = '';
    });
}