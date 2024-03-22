import commands from "../others/commands.json" assert { type: 'json' };
var commandType = document.querySelectorAll('.command-type');
var commandsDiv = document.querySelector('.commands');

var categories = {
    'admin': 'Admin: ',
    'economy': 'Economía',
    'other': 'Otros'
}

commands.forEach(cmd => {
    var div = document.createElement('div');
    div.classList = `command ${cmd.category}`;
    div.innerHTML = `<p class="name title description">${cmd.name}</p>
    <p class="description secondary">${categories[cmd.category] + (cmd.memberPermission ?? '')}</p>
    <br>
    <p class="description">${cmd.description}</p><br>
    <p class="description">Uso: </p>`;

    var usage = document.createElement('p');
    usage.textContent = cmd.usage;
    usage.classList = 'description marked';

    div.appendChild(usage);
    commandsDiv.appendChild(div);
});

commandType.forEach(type => {
    type.addEventListener('click', () => {
        commandType.forEach(x => x.classList.remove('selected'));
        type.classList.add('selected');

        let allCommands = document.querySelectorAll('.command');

        let commands = document.querySelectorAll(`.${type.id}`);
        if (type.id === 'all') commands = document.querySelectorAll(`.command`);

        allCommands.forEach(x => { 
            x.style.position = 'absolute';
            x.style.opacity = '0';
        });
        commands.forEach(x => { 
            x.style.position = 'relative';
            x.style.opacity = '1';
        });
    });
});