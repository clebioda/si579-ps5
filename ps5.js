/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 * 
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 * 
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

function addS(num) {
    if (num === 1) {
      return "";
    } else {
      return "s";
    }
  }

const rhymesButton = document.getElementById("show_rhymes");
const synonymsButton = document.getElementById('show_synonyms');
const outputDescription = document.getElementById('output_description');
const output = document.getElementById('word_output');
const savedWords = document.getElementById('saved_words');
const wordInput = document.getElementById('word_input');
const savedList = [];
savedWords.textContent = '(none)';
outputDescription.textContent = '';
output.textContent = '';

rhymesButton.addEventListener('click', () => {
    getWords(true);
});
synonymsButton.addEventListener('click', () => {
    getWords(false);
});
wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        getWords(true);
    }
});
rhymesButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        getWords(true);
    }
});
synonymsButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        getWords(false);
    }
});

function createWordItem(item) {
    const wordElement = document.createElement('li');
    wordElement.textContent = item.word;
    const saveButton = document.createElement('button');
    saveButton.textContent = '(save)';
    saveButton.classList.add('btn', 'btn-outline-success');
    saveButton.addEventListener('click', () => {
        if(!savedList.includes(item.word)) {
            if (savedList.length === 0) {
                savedWords.textContent = '';
            }
            savedList.push(item.word);
            savedWords.textContent = savedList.join(', ');
        }
    });
    wordElement.append(saveButton);
    output.append(wordElement);
}

async function getWords(isRhyme) {
    outputDescription.textContent = isRhyme ? `Words that rhyme with ${wordInput.value}: `
    : `Words with a meaning similar to ${wordInput.value}: `;
    let url = 'https://api.datamuse.com/words?';
    url = isRhyme ? url + 'rel_rhy='+wordInput.value : url + 'ml='+wordInput.value;
    output.textContent = '...loading';
    try {
        const response = await fetch(url);
        const data = await response.json();
        output.textContent = '';
        if(data.length > 0) {
            if(isRhyme) {
                const groups = groupBy(data, 'numSyllables');
                for(const group in groups) {
                    let groupTitle = document.createElement("h3");
                    groupTitle.textContent = `${group} syllable${addS(Number(group))}:`;
                    output.append(groupTitle);
                    for(const item of groups[group]) {
                        createWordItem(item);
                    }
                }
            }
            else {
                for(const item of data) {
                    createWordItem(item);
                }
            }
        }
        else {
            output.textContent = '(no results)';
        }
    } catch (error) {
        outputDescription.textContent = "Failed to fetch from Datamuse API."
    }
}

