//process_jquery_primitives
// externs = jquery.min.js
$('#input-commands').change(function() {
    isDirty = true;
});

// Warn users if there is an unsaved project open and they are closing the page
var isDirty = false;

/*  window.onbeforeunload = function (e) {
		        if (!isDirty) {
		            return undefined;
		        }

		        var confirmationMessage = 'It looks like you have been editing something. '
		                                + 'If you leave before saving, your changes will be lost.';

		        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
		        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
		    };
*/

useHopperClock = false;

function optionHopperClockChange() {
    if ($('#option-hopper-clock').is(':checked')) {
        useHopperClock = true;
    } else {
        useHopperClock = false;
    }
}

useServerSigns = true;
// function optionServerSignsChange() {
// 	if ($('#option-server-signs').is(':checked')) {
// 		useServerSigns = true;
// 	} else {
// 		useServerSigns = false;
// 	}
// }



var nbtSelectorCur = 1;
var scoreboardObjInUse = [false, false, false];
var nbtScoreArr = [];

function nbtInSelectors(currentCommand) {
    var pattern = /@[eapr]\[.*nbt=\{(.*?)\}.*\]/g;
    if (!pattern.test(currentCommand)) {
        // End the function here if it doesn't include an NBT shortcut
        return;
    }

    scoreboardObjInUse[1] = true;

    var entitySelectorChar = currentCommand.split(/ (@[eapr])\[/g)[1];
    var scoreboardObjName = inputScoreboard + '_N';
    var nbtStr = currentCommand.split(pattern)[1];

    var objectiveAlreadyExists = false;
    var finalCur = 0;

    for (n = 0; n < nbtScoreArr.length; n++) {
        if (nbtScoreArr[n].nbtstr == nbtStr) {
            objectiveAlreadyExists = true;
            finalCur = nbtScoreArr[n].score;
        }
    }

    if (!objectiveAlreadyExists) {
        nbtScoreArr[nbtScoreArr.length] = {
            nbtstr: nbtStr,
            score: nbtSelectorCur
        };
        finalCur = nbtSelectorCur;
    }

    allCommands.splice(i, 0, {
        cmd: 'scoreboard players set ' + entitySelectorChar + ' ' + scoreboardObjName + ' ' + finalCur + ' {' + nbtStr + '}',
        tag: 'none'
    });

    // Add a command at the end to reset the score each tick
    allCommands[allCommands.length] = {
        cmd: 'scoreboard players reset @e ' + scoreboardObjName,
        tag: 'none'
    };

    // Add 1 to i since the previous index will change to the inserted object
    i++;

    allCommands[i].cmd = allCommands[i].cmd.replace(/,nbt=\{.*?\},/g, ',score_' + scoreboardObjName + '_min=' + finalCur + ',score_' + scoreboardObjName + '=' + finalCur + ',');
    allCommands[i].cmd = allCommands[i].cmd.replace(/,nbt=\{.*?\}/g, ',score_' + scoreboardObjName + '_min=' + finalCur + ',score_' + scoreboardObjName + '=' + finalCur);
    allCommands[i].cmd = allCommands[i].cmd.replace(/nbt=\{.*?\},/g, 'score_' + scoreboardObjName + '_min=' + finalCur + ',score_' + scoreboardObjName + '=' + finalCur + ',');
    allCommands[i].cmd = allCommands[i].cmd.replace(/nbt=\{.*?\}/g, 'score_' + scoreboardObjName + '_min=' + finalCur + ',score_' + scoreboardObjName + '=' + finalCur);

    // Increase i again so that it doesn't repeat into an infinite loop
    // i++;

    if (!objectiveAlreadyExists) {
        nbtSelectorCur++;
    }
}

function loadProject(projectJSON) {
    var importJSON = JSON.parse(projectJSON);
    // var users = localStorage.registeredUsers? JSON.parse(localStorage.registeredUsers) : [];

    // Settings
    $('#structure-orientation-input').val(importJSON.settings.orientation);
    $('#option-box-offset-x').val(importJSON.settings.offset[0]);
    $('#option-box-offset-y').val(importJSON.settings.offset[1]);
    $('#option-box-offset-z').val(importJSON.settings.offset[2]);
    $('#option-box-length-x').val(importJSON.settings.dimensions[0]);
    $('#option-box-length-z').val(importJSON.settings.dimensions[1]);
    $('#option-box-encase').prop('checked', importJSON.settings.casing.enabled);
    $('#option-box-encase-block-caps').val(importJSON.settings.casing.caps);
    $('#option-box-encase-block-window').val(importJSON.settings.casing.sides);
    $('#option-advanced-objectivename').val(importJSON.settings.scoreboard);
    if (importJSON.settings.hopper)
        $('#option-hopper-clock').prop('checked', false).click();
    if (importJSON.settings.svrsigns)
        $('#option-server-signs').prop('checked', false).click();

    // Signs
    $('.sign-item').remove();
    // Creates the correct amount of sign item divs
    for (j = 0; j < importJSON.settings.signs.length; j++) {
        addSign();
    }
    // Fill those divs with the correct values
    var signImportCounter = 0;
    $('.sign-item').each(function(signIndex, signValue) {
        $(signValue).children('.sign-input-line').each(function(signSubIndex, signSubValue) {
            $(signSubValue).val(importJSON.settings.signs[signIndex][signSubIndex].txt);
        });
        $(signValue).children('.sign-input-color').each(function(signSubIndex, signSubValue) {
            $(signSubValue).val(importJSON.settings.signs[signIndex][signSubIndex].clr);
        });
        $(signValue).children('.sign-input-cmd').each(function(signSubIndex, signSubValue) {
            $(signSubValue).val(importJSON.settings.signs[signIndex][signSubIndex].command);
        });
        $(signValue).children('.sign-input-style-bold').each(function(signSubIndex, signSubValue) {
            $(signSubValue).prop('checked', importJSON.settings.signs[signIndex][signSubIndex].bold);
        });
        $(signValue).children('.sign-input-style-italics').each(function(signSubIndex, signSubValue) {
            $(signSubValue).prop('checked', importJSON.settings.signs[signIndex][signSubIndex].italics);
        });
        $(signValue).children('.sign-input-style-bold').each(function(signSubIndex, signSubValue) {
            $(signSubValue).prop('checked', importJSON.settings.signs[signIndex][signSubIndex].underline);
        });
        $(signValue).children('.sign-input-destroy').each(function(signSubIndex, signSubValue) {
            if (importJSON.settings.signs[signIndex][0].destroy)
                $(signSubValue).trigger('click');
        });
        $(signValue).children('.sign-input-activatetoggle').each(function(signSubIndex, signSubValue) {
            if (importJSON.settings.signs[signIndex][0].tog)
                $(signSubValue).trigger('click');
        });
    });

    // Commands
    $('#input-commands').val(importJSON.cmds);
}

function generateExportString() {
    // var exportCommandsString = '$*!*$' + ($('#input-commands').val().replace(/\n/g, '_*&*_'));
    var exportCommandsArray = $('#input-commands').val();
    var settings = {
        orientation: $('#structure-orientation-input').val(),
        offset: [$('#option-box-offset-x').val(), $('#option-box-offset-y').val(), $('#option-box-offset-z').val()],
        dimensions: [$('#option-box-length-x').val(), $('#option-box-length-z').val()],
        casing: {
            enabled: $('#option-box-encase').is(':checked'),
            caps: $('#option-box-encase-block-caps').val(),
            sides: $('#option-box-encase-block-window').val()
        },
        scoreboard: $('#option-advanced-objectivename').val(),
        signs: [],
        hopper: $('#option-hopper-clock').is(":checked"),
        svrsigns: $('#option-server-signs').is(":checked")
    }

    $('.sign-item').each(function(signIndex, signValue) {
        settings.signs[settings.signs.length] = [];
        var currentSign = {
            lines: [],
            bold: [],
            italics: [],
            underline: [],
            txtcolor: [],
            command: [],
            destroy: false,
            tog: false
        };

        $(signValue).children('.sign-input-line').each(function(signSubIndex, signSubValue) {
            currentSign.lines[currentSign.lines.length] = $(signSubValue).val();
        });
        $(signValue).children('.sign-input-cmd').each(function(signSubIndex, signSubValue) {
            currentSign.command[currentSign.command.length] = $(signSubValue).val();
        });
        $(signValue).children('.sign-input-style-italics').each(function(signSubIndex, signSubValue) {
            currentSign.italics[currentSign.italics.length] = $(signSubValue).is(':checked');
        });
        $(signValue).children('.sign-input-style-bold').each(function(signSubIndex, signSubValue) {
            currentSign.bold[currentSign.bold.length] = $(signSubValue).is(':checked');
        });
        $(signValue).children('.sign-input-style-underline').each(function(signSubIndex, signSubValue) {
            currentSign.underline[currentSign.underline.length] = $(signSubValue).is(':checked');
        });
        $(signValue).children('.sign-input-color').each(function(signSubIndex, signSubValue) {
            currentSign.txtcolor[currentSign.txtcolor.length] = $(signSubValue).val();
        });

        if ($(this).children('.sign-input-destroy').is(':checked')) {
            currentSign.destroy = true;
        }
        if ($(this).children('.sign-input-activatetoggle').is(':checked')) {
            currentSign.tog = true;
        }

        for (i = 0; i < currentSign.lines.length; i++) {
            settings.signs[settings.signs.length - 1][settings.signs[settings.signs.length - 1].length] = {
                txt: currentSign.lines[i],
                clr: currentSign.txtcolor[i],
                bold: currentSign.bold[i],
                italics: currentSign.italics[i],
                underline: currentSign.underline[i],
                command: currentSign.command[i]
            }
            settings.signs[settings.signs.length - 1][0].destroy = currentSign.destroy;
            settings.signs[settings.signs.length - 1][0].tog = currentSign.tog;
        }
    });

    // var exportSettingsString = '';
    // for (i = 0; i < setings.signs)

    var outputTotalLen = 0;
    $('.output-command').each(function() {
        outputTotalLen += $(this).val().length;
    });

    var exportJSON = {
        cmds: exportCommandsArray,
        settings: settings,
        len: outputTotalLen
    };

    console.log("read below:");
    console.log(exportJSON);

    return JSON.stringify(exportJSON);
}

$('#manual-projects-button').click(function() {
    $('#export-textarea').val(generateExportString());
    $('#export-container').fadeIn(200);
});

$('#manual-projects-import').click(function() {
    $('#import-container').fadeIn(200);
});

$('.page-fade').click(function() {
    $(this).parent().fadeOut(350);
});

$('.exit').click(function() {
    $(this).parent().parent().parent().fadeOut(350);
});

function predictCommandLength() {
    // NOT CURRENTLY IN USE
    var previousOutputCommand = $('#output-command').val();
    generateCompactCommand();
    var commandLength = 0;
    $('.output-command').each(function() {
        commandLength += $(this).val().length;
    });
    $('#output-command').val(previousOutputCommand);
    return commandLength;
}


var helpSelected = 'none';
$('#help-show-functions').click(function() {
    if (helpSelected !== 'functions') {
        $('.help-container').slideUp();
        $('#help-built-in-functions').slideDown();
        helpSelected = 'functions';
    } else {
        $('.help-container').slideUp();
        helpSelected = 'none';
    }
});

$('#help-show-how-to').click(function() {
    if (helpSelected !== 'howto') {
        $('.help-container').slideUp();
        $('#help-how-to').slideDown();
        helpSelected = 'howto';
    } else {
        $('.help-container').slideUp();
        helpSelected = 'none';
    }
});

$('#help-show-others').click(function() {
    if (helpSelected !== 'others') {
        $('.help-container').slideUp();
        $('#help-others').slideDown();
        helpSelected = 'others';
    } else {
        $('.help-container').slideUp();
        helpSelected = 'none';
    }
});

$(document).ready(function() {
    // Randomize the box case blocks upon page load
    $('#option-box-encase-block-window').val(('stained_glass ' + Math.round(Math.random() * 15)));
    $('#option-box-encase-block-caps').val('stained_hardened_clay ' + (Math.round(Math.random() * 15)));
    $('#option-advanced-objectivename').val(makeRandomStr(6));
});

$('#generate').click(function() {
    // try {
    generateCompactCommand();
    // } catch(err) {
    // 	console.log(err);
});

var globalBoxLength = 0;

function generateCompactCommand() {
    var inputOffX = parseInt($('#option-box-offset-x').val());
    var inputOffY = parseInt($('#option-box-offset-y').val());
    var inputOffZ = parseInt($('#option-box-offset-z').val());

    boxLengthX = parseInt($('#option-box-length-x').val());
    boxLengthZ = parseInt($('#option-box-length-z').val());

    if (parseInt($('#structure-orientation-input').val()) == 3)
        inputOffX++;

    fetchCommands();
    getBoxDimensionInputs();
    generateCoordinates(boxLengthX, boxLengthZ);
    offsetCoordinates(inputOffX, inputOffY, inputOffZ, parseInt($('#structure-orientation-input').val()));
    formatEscaping();
    generateCasing($('#option-box-encase-block-window').val(), $('#option-box-encase-block-caps').val(), parseInt($('#structure-orientation-input').val()), inputOffX, inputOffY, inputOffZ);
    generateRotatedCoordinates(parseInt($('#structure-orientation-input').val()));
    setupSigns(parseInt($('#structure-orientation-input').val()), inputOffX, inputOffY, inputOffZ);
    getCoordTags();
    insertCoordTags();
    setupPrevCoords();
    createScoreObjAddCmds()
    generateOutputCommand();
}

// Create the array for the commands along with their tags
allCommands = [];

function createScoreObjAddCmds() {
    if (scoreboardObjInUse[0]) {
        allInitCommands.splice(0, 0, {
            cmd: 'scoreboard objectives add ' + inputScoreboard + '_I dummy',
            tag: 'none'
        });
    }
    if (scoreboardObjInUse[1]) {
        allInitCommands.splice(0, 0, {
            cmd: 'scoreboard objectives add ' + inputScoreboard + '_N dummy',
            tag: 'none'
        });
    }
    if (scoreboardObjInUse[2]) {
        allInitCommands.splice(0, 0, {
            cmd: 'scoreboard objectives add ' + inputScoreboard + '_A dummy',
            tag: 'none'
        }, {
            cmd: 'summon armor_stand ~' + allCommands[0].posX + ' ~' + allCommands[0].posY + ' ~' + allCommands[0].posZ + ' {CustomName:TogAct,Marker:1,NoGravity:1,Invisible:1}',
            tag: 'none'
        });
    }
}

function getCoordTags() {
    coordTags = [];
    for (i = 0; i < allCommands.length; i++) {
        if (allCommands[i].tag == 'tagged') {
            coordTags[coordTags.length] = {
                identifier: allCommands[i].tagid,
                loc: [allCommands[i].posX, allCommands[i].posY, allCommands[i].posZ]
            };
        }
    }
}

function insertCoordTags() {
    for (i = 0; i < allCommands.length; i++) {
        if (allCommands[i].cmd.indexOf('@TAG-') >= 0) {
            for (c = 0; c < coordTags.length; c++) {
                allCommands[i].cmd = allCommands[i].cmd.replace("@TAG-" + coordTags[c].identifier, ('~' + (coordTags[c].loc[0] - allCommands[i].posX) + ' ~' + (coordTags[c].loc[1] - allCommands[i].posY) + ' ~' + (coordTags[c].loc[2] - allCommands[i].posZ)));
            }
        }
    }
}

function getBoxDimensionInputs() {
    inputOffsetX = parseInt($('#option-box-offset-x').val());
    inputOffsetY = parseInt($('#option-box-offset-y').val());
    inputOffsetZ = parseInt($('#option-box-offset-z').val());
    inputLimitX = boxLengthX;
    inputLimitZ = boxLengthZ;
}

function ifSignsEnabled() {
    $('.sign-item').each(function() {
        return true;
    });
    return false;
}

$('#add-sign').click(function() {
    addSign();
});

function addSign() {
    var totalText = '';
    totalText = totalText + "<div class='sign-item'><div class='sign-reorder'><i class='fa fa-caret-up sign-reorder-up'></i><i class='fa fa-caret-down sign-reorder-down'></i></div><input type='text' placeholder='Click Command 1' class='sign-input-cmd'><input type='text' placeholder='Click Command 2' class='sign-input-cmd'><input type='text' placeholder='Click Command 3' class='sign-input-cmd'><input type='text' placeholder='Click Command 4' class='sign-input-cmd sign-input-cmd-destroy'><br>";
    for (i = 0; i < 4; i++) {
        totalText = totalText + "<input type='text' placeholder='Line " + (i + 1) + "' class='sign-input-line'><select class='sign-input-color'><option value='black'>Black</option><option value='dark_blue'>Dark Blue</option><option value='dark_green'>Dark Green</option><option value='dark_aqua'>Dark Aqua</option><option value='dark_red'>Dark Red</option><option value='dark_purple'>Dark Purple</option><option value='gold'>Gold</option><option value='gray'>Gray</option><option value='dark_gray'>Dark Gray</option><option value='blue'>Blue</option><option value='green'>Green</option><option value='aqua'>Aqua</option><option value='red'>Red</option><option value='light_purple'>Light Purple</option><option value='yellow'>Yellow</option><option value='white'>White</option></select> <input type='checkbox' class='sign-input-style-italics'>Italics <input type='checkbox' class='sign-input-style-bold'>Bold <input type='checkbox' class='sign-input-style-underline'>Underline<br>";
    }
    totalText = totalText + "<input type='checkbox' class='sign-input-activatetoggle'><span class='sign-label-activatetoggle'>Activate/Deactivate Machine </span> <input type='checkbox' class='sign-input-destroy'><span class='sign-label-destroy'>Destroy Machine</span> <span class='remove-sign'>Remove Sign</span></div>";
    $('#sign-container').append(totalText);
}

$(document).on('click', '.remove-sign', function() {
    $(this).parent().remove();
});

function setupSigns(orientation, offsetX, offsetY, offsetZ) {
    // Signs
    // Get input data for each sign
    var signLines = [];
    var signLineIndex = 0;
    $('.sign-item').each(function(signIndex, signValue) {
        signLines[signLines.length] = [];
        $(signValue).children('.sign-input-line').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLines[signLines.length - 1].length] = {
                lineText: $(signSubValue).val()
            };
        });
        signLineIndex = 0;
        $(signValue).children('.sign-input-color').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLineIndex].lineColor = $(signSubValue).val();
            signLineIndex += 1;
        });
        signLineIndex = 0;
        $(signValue).children('.sign-input-style-italics').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLineIndex].lineItalic = $(signSubValue).is(':checked');
            signLineIndex += 1;
        });
        signLineIndex = 0;
        $(signValue).children('.sign-input-style-bold').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLineIndex].lineBold = $(signSubValue).is(':checked');
            signLineIndex += 1;
        });
        signLineIndex = 0;
        $(signValue).children('.sign-input-style-underline').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLineIndex].lineUnderlined = $(signSubValue).is(':checked');
            signLineIndex += 1;
        });
        signLineIndex = 0;
        $(signValue).children('.sign-input-cmd').each(function(signSubIndex, signSubValue) {
            signLines[signLines.length - 1][signLineIndex].lineCommand = $(signSubValue).val().replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            signLineIndex += 1;
        });

        var destroyChecked = $(signValue).children('.sign-input-destroy').is(':checked');
        var activateToggleChecked = $(signValue).children('.sign-input-activatetoggle').is(':checked');

        if (destroyChecked) {
            signLines[signLines.length - 1][3].lineCommand = 'DESTROYMACHINE';
        }
        if (activateToggleChecked) {
            for (l = 0; l < 4; l++)
                signLines[signLines.length - 1][l].lineCommand = 'TOGGLEACTIVE';
        }

    });

    // Adding the signs to the box
    var signJsonData = '';
    var signHeightY = 0;
    var signLineCommand = '';
    var signOffset = {};
    for (i = 0; i < signLines.length; i++) {
        // Clear the sign json data to be used again
        signJsonData = '';

        // Figure out the sign's location
        // Calculate what the height of the sign should be so that it is vertically centered
        signHeightY = Math.ceil((getHighestY() - offsetY) / 2) - Math.floor(signLines.length / 2) + i - 1 + offsetY;
        var signLoc = {};
        var wallsignRotation = 4;
        signLoc.xPos = 1;
        signLoc.zPos = 0;

        // Add offsets
        signLoc.xPos += offsetX;
        signLoc.zPos += offsetZ;

        if (orientation == 2) {
            signLoc.xPos *= -1;
            signLoc.zPos *= -1;
            wallsignRotation = 5;
        } else if (orientation == 3) {
            signLoc.zPos = [signLoc.xPos, signLoc.xPos = signLoc.zPos][0]; // Swap the X and Z values
            signLoc.xPos *= -1;
            wallsignRotation = 2;
        } else if (orientation == 4) {
            signLoc.zPos = [signLoc.xPos, signLoc.xPos = signLoc.zPos][0]; // Swap the Z and X values
            signLoc.zPos *= -1;
            wallsignRotation = 3
        }

        for (b = 0; b < signLines[i].length; b++) {
            if (signLines[i][b].lineText.length >= 1 || (useServerSigns && signLines[i][b].lineCommand.length === 0)) {
                // If a command is set for this line and there is also text
                if (signLines[i][b].lineCommand.length >= 1) {
                    // Make the destroy command coordinates relative to the sign's coordinates!
                    signLineCommand = formatForClickevent(signJsonData, signLines, signLoc, signHeightY);
                } else {
                    signLineCommand = '';
                }

                signJsonData = signJsonData + ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"' + signLines[i][b].lineText + '\\\\\\"';

                if (signLines[i][b].lineColor !== 'black') {
                    signJsonData += ',\\\\\\"color\\\\\\":\\\\\\"' + signLines[i][b].lineColor + '\\\\\\"';
                }

                signJsonData += signLineCommand;

                if (signLines[i][b].lineItalic == true) {
                    signJsonData = signJsonData + ',\\\\\\"italic\\\\\\":true';
                }
                if (signLines[i][b].lineBold == true) {
                    signJsonData = signJsonData + ',\\\\\\"bold\\\\\\":true';
                }
                if (signLines[i][b].lineUnderlined == true) {
                    signJsonData = signJsonData + ',\\\\\\"underlined\\\\\\":true';
                }
                signJsonData = signJsonData + '}"';
            } else if (signLines[i][b].lineCommand.length >= 1) {
                // If there is no text but there is a command set
                signJsonData += formatForClickevent(signJsonData, signLines, signLoc, signHeightY);
            }
        }
        signJsonData = signJsonData.replace(',', ''); // Remove the extra comma at the beginning
        allInitCommands.splice(0, 0, {
            cmd: 'setblock ~' + (signLoc.xPos) + ' ~' + (signHeightY) + ' ~' + (signLoc.zPos) + ' wall_sign ' + wallsignRotation + ' 0 {' + signJsonData + '}',
            tag: 'sign'
        });
    }
}

function formatForClickevent(signJsonData, signLines, signLoc, signHeightY) {
    var orientation = parseInt($('#structure-orientation-input').val());

    var coordinates = [(getLowestX() - 2 - signLoc.xPos), (getLowestY() - 1 - signHeightY), (getLowestZ() - 1 - signLoc.zPos), (getHighestX() + 1 - signLoc.xPos), (getHighestY() + 1 - signHeightY), (getHighestZ() + 1 - signLoc.zPos)];

    // Doesn't need to account for orientation because the rotation has already taken place on the command blocks by this point, so it doesn't need to calculate it independently
    // The only exception is that it should decrease(?) the Z coordinates by 1 if the orientation is Z+ (3), because the box will automatically have 1 added to it if so, since the machine would be too close to the initial stack otherwise.

    // if (orientation == 2) {
    // 	coordinates[0] = -coordinates[0];
    // 	coordinates[3] = -coordinates[3];
    // } else if (orientation == 3) {
    // 	// Switch X and Z
    // 	coordinates[2] = [coordinates[0], coordinates[0] = coordinates[2]][0];
    // 	coordinates[5] = [coordinates[3], coordinates[3] = coordinates[5]][0];
    // 	// Negate X
    // 	coordinates[0] = -coordinates[0];
    // 	coordinates[3] = -coordinates[3];
    // } else if (orientation == 4) {
    // 	coordinates[2] = [coordinates[0], coordinates[0] = coordinates[2]][0];
    // 	coordinates[5] = [coordinates[3], coordinates[3] = coordinates[5]][0];
    // 	coordinates[2] = -coordinates[2];
    // 	coordinates[5] = -coordinates[5];
    // }

    if (orientation == 3) {
        coordinates[2]--;
    }

    var toggleActiveScore = $('#option-advanced-objectivename').val() + '_A';
    if (signLines[i][b].lineText.length >= 1) {
        // Has text and has a command
        if (signLines[i][b].lineCommand == 'TOGGLEACTIVE') {
            scoreboardObjInUse[2] = true;
            if (b == 0) {
                var clickeventCommand = ',\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('scoreboard players add @e[type=armor_stand,name=TogAct,c=1] ' + toggleActiveScore + ' 1') + '\\\\\\"}';
            } else if (b == 1) {
                var clickeventCommand = ',\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('execute @e[score_' + toggleActiveScore + '_min=1,score_' + toggleActiveScore + '=1] ~ ~ ~ blockdata ~ ~ ~ {auto:0}') + '\\\\\\"}';
            } else if (b == 2) {
                var clickeventCommand = ',\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('execute @e[score_' + toggleActiveScore + '_min=2] ~ ~ ~ blockdata ~ ~ ~ {auto:1}') + '\\\\\\"}';
            } else if (b == 3) {
                var clickeventCommand = ',\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('scoreboard players reset @e[score_' + toggleActiveScore + '_min=2] ' + toggleActiveScore) + '\\\\\\"}';
            }
        } else {
            // Regular for having text and a command
            var clickeventCommand = ',\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + signLines[i][b].lineCommand.replace('DESTROYMACHINE', ('fill ~' + coordinates[0] + ' ~' + coordinates[1] + ' ~' + coordinates[2] + ' ~' + coordinates[3] + ' ~' + coordinates[4] + ' ~' + coordinates[5] + ' air')) + '\\\\\\"}';
        }
    } else {
        // Doesn't have any text, but has a command
        if (signLines[i][b].lineCommand == 'TOGGLEACTIVE') {
            scoreboardObjInUse[2] = true;
            if (b == 0) {
                var clickeventCommand = ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"\\\\\\",\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('scoreboard players add @e[type=armor_stand,name=TogAct,c=1] ' + toggleActiveScore + ' 1') + '\\\\\\"}}"';
            } else if (b == 1) {
                var clickeventCommand = ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"\\\\\\",\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('execute @e[score_' + toggleActiveScore + '_min=1,score_' + toggleActiveScore + '=1] ~ ~ ~ blockdata ~ ~ ~ {auto:0}') + '\\\\\\"}}"';
            } else if (b == 2) {
                var clickeventCommand = ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"\\\\\\",\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('execute @e[score_' + toggleActiveScore + '_min=2] ~ ~ ~ blockdata ~ ~ ~ {auto:1}') + '\\\\\\"}}"';
            } else if (b == 3) {
                var clickeventCommand = ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"\\\\\\",\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + ('scoreboard players reset @e[score_' + toggleActiveScore + '_min=2] ' + toggleActiveScore) + '\\\\\\"}}"';
            }
        } else {
            var clickeventCommand = ',Text' + (b + 1) + ':"{\\\\\\"text\\\\\\":\\\\\\"\\\\\\",\\\\\\"clickEvent\\\\\\":{\\\\\\"action\\\\\\":\\\\\\"run_command\\\\\\",\\\\\\"value\\\\\\":\\\\\\"' + signLines[i][b].lineCommand.replace('DESTROYMACHINE', ('fill ~' + coordinates[0] + ' ~' + coordinates[1] + ' ~' + coordinates[2] + ' ~' + coordinates[3] + ' ~' + coordinates[4] + ' ~' + coordinates[5] + ' air')) + '\\\\\\"}}"';
        }
    }
    return clickeventCommand;
}

function getHighestY() {
    var highestVal = -999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posY > highestVal) {
            highestVal = allCommands[g].posY;
        }
    }
    return highestVal;
}

function getLowestY() {
    var lowestVal = 999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posY < lowestVal) {
            lowestVal = allCommands[g].posY;
        }
    }
    return lowestVal;
}

function getHighestX() {
    var highestVal = -999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posX > highestVal) {
            highestVal = allCommands[g].posX;
        }
    }
    return highestVal;
}

function getLowestX() {
    var highestVal = 999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posX < highestVal) {
            highestVal = allCommands[g].posX;
        }
    }
    return highestVal;
}

function getHighestZ() {
    var highestVal = -999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posZ > highestVal) {
            highestVal = allCommands[g].posZ;
        }
    }
    return highestVal;
}

function getLowestZ() {
    var highestVal = 999;
    for (g = 0; g < allCommands.length; g++) {
        if (allCommands[g].posZ < highestVal) {
            highestVal = allCommands[g].posZ;
        }
    }
    return highestVal;
}

$(document).on('click', '.sign-reorder-up', function() {
    var current = $(this).parent().parent();
    current.prev().before(current);
});

$(document).on('click', '.sign-reorder-down', function() {
    var current = $(this).parent().parent();
    current.next().after(current);
});

$(document).on('change', '.sign-input-destroy', function() {
    if ($(this).is(':checked')) {
        $(this).siblings('.sign-input-cmd-destroy').css('display', 'none');
        $(this).siblings('.sign-input-activatetoggle').attr('disabled', true);
        $(this).siblings('.sign-label-activatetoggle').css('opacity', '.50');
    } else {
        $(this).siblings('.sign-input-cmd-destroy').css('display', 'inline');
        $(this).siblings('.sign-input-activatetoggle').removeAttr('disabled');
        $(this).siblings('.sign-label-activatetoggle').css('opacity', '1');
    }
});

$(document).on('change', '.sign-input-activatetoggle', function() {
    if ($(this).is(':checked')) {
        $(this).siblings('.sign-input-cmd').css('display', 'none');
        $(this).siblings('.sign-input-destroy').attr('disabled', true);
        $(this).siblings('.sign-label-destroy').css('opacity', '.50');
    } else {
        $(this).siblings('.sign-input-cmd').css('display', 'inline');
        $(this).siblings('.sign-input-destroy').removeAttr('disabled');
        $(this).siblings('.sign-label-destroy').css('opacity', '1');
    }
});

function getDelimiter(commandString) {
    if ($('#import-mcedit').is(':checked')) {
        if (commandString.indexOf('_*&amp;*_') >= 0) {
            return '_*&amp;*_';
        } else {
            return '_*&*_';
        }
    } else {
        return '\n';
    }
}

function splitCommands(commandString) {
    var commandInputArray = commandString.split(getDelimiter(commandString));
    return commandInputArray;
}

function setupPrevCoords() {
    for (i = 0; i < allCommands.length; i++) {
        if (allCommands[i].cmd.indexOf('@prev@') >= 0) {
            allCommands[i].cmd = allCommands[i].cmd.replace(/@prev@/g, ('~' + (allCommands[i - 1].posX - allCommands[i].posX) + ' ~' + (allCommands[i - 1].posY - allCommands[i].posY) + ' ~' + (allCommands[i - 1].posZ - allCommands[i].posZ)));
        }
    }
}

function removeBlankCommands() {
    for (i = 0; i < allCommands.length; i++) {
        if (allCommands[i].cmd.length <= 0) {
            allCommands.splice(i, 1);
        }
    }
}

function fetchCommands() {
    allCommands = [];
    allInitCommands = [];
    inputScoreboard = $('#option-advanced-objectivename').val();
    // Take the entire command-string and separate each command by \n (each new line)
    var commandInputArray = splitCommands($('#input-commands').val());

    // Give each command its necessary tag if needed (init, if, then)
    floorCraftingCount = 0;
    var floorCraftingReturnArr = [];
    if ($('#option-compressor').is(':checked')) {
        compress = true;
    }else{
      compress = false;
    }

    // Multi-line command modifiers
    var multilineContinue = true;
    var multilineIndex = 0;
    var multilineModifiers = '';
    if (compress) {
      //commandInputArray = shortHand(commandInputArray);
        commandInputArray = compressor(commandInputArray);
    }
    for (i = 0; i < commandInputArray.length; i++) {
        if (commandInputArray[i].substring(0, 2) == '/*') {
            multilineModifiers = commandInputArray[i].substring(2, commandInputArray[i].length);
            commandInputArray.splice(i, 1);
            multilineIndex = i - 1;
            while (multilineContinue == true) {
                multilineIndex++;
                if (commandInputArray[multilineIndex] == undefined) {
                    multilineContinue = false;
                } else {
                    if (!(commandInputArray[multilineIndex].substring(0, 2).indexOf('#') >= 0 || commandInputArray[multilineIndex].length <= 0 || commandInputArray[multilineIndex] == ' ')) {
                        if (commandInputArray[multilineIndex] == '*/') {
                            multilineContinue = false;
                            commandInputArray.splice(multilineIndex, 1);
                        } else {
                            commandInputArray[multilineIndex] = multilineModifiers + commandInputArray[multilineIndex];
                        }
                    }
                }
            }
        }
    }

    for (i = 0; i < commandInputArray.length; i++) {
        if (commandInputArray[i].substring(0, 5) == 'INIT:') {
            // Init commands go in a different array!
            allInitCommands[allInitCommands.length] = {
                cmd: commandInputArray[i].substring(5, commandInputArray[i].length),
                tag: 'init'
            };
        } else if (commandInputArray[i].substring(0, 11).indexOf('IF:') >= 0) {
            // IF will be optional, and won't really do anything other than help read through the source commands
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i].replace('IF:', ''),
                tag: 'if'
            };

        } else if (commandInputArray[i].substring(0, 11).indexOf('DO:') >= 0) {
            // DO will simply make the command block conditional (add 8 to the damage value). Since it will work that way, if 1 DO command fails, the rest won't run.
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i].replace('DO:', ''),
                tag: 'do'
            };

        } else if (commandInputArray[i].substring(0, 13).indexOf('COND:') >= 0) {
            // DO will simply make the command block conditional (add 8 to the damage value). Since it will work that way, if 1 DO command fails, the rest won't run.
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i].replace('COND:', ''),
                tag: 'do'
            };

        } else if (commandInputArray[i].indexOf('@prev@') >= 0) {
            // When a command includes '@prev', it will replace '@prev' with the relative coordinates of the previous command block.
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i],
                tag: 'prev'
            };

        } else if (commandInputArray[i].substring(0, 12).indexOf('TAG#') >= 0) {
            // When a command starts with 'TAG#', it will track the number after it.
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i].substring((commandInputArray[i].indexOf(':') + 1), commandInputArray[i].length),
                tag: 'tagged',
                tagid: commandInputArray[i].substring(4, commandInputArray[i].indexOf(':'))
            };

        } else if (commandInputArray[i].substring(0, 2).indexOf('#') >= 0 || commandInputArray[i].length <= 0 || commandInputArray[i] == ' ') {
            // Don't do anything since it is a comment or an empty line
        } else if (commandInputArray[i].substring(0, 15).indexOf('FloorCrafting:') >= 0) {
            // Generate the commands for the floorcrafting
            floorCraftingReturn = generateFloorCrafting(commandInputArray[i]);
            for (r = 0; r < floorCraftingReturn.reg.length; r++) {
                allCommands[allCommands.length] = floorCraftingReturn.reg[r];
            }
            for (r = 0; r < floorCraftingReturn.init.length; r++) {
                allInitCommands[allInitCommands.length] = floorCraftingReturn.init[r];
            }
        } else {
            allCommands[allCommands.length] = {
                cmd: commandInputArray[i],
                tag: 'none'
            };
        }
    }

    // Loop again and find any commands with I: R: or NA: or NT: (impulse command blocks, repeating command blocks, and 'not auto')
    for (i = 0; i < allCommands.length; i++) {
        // No Auto
        if (allCommands[i].cmd.substring(0, 13).indexOf('NA:') >= 0) {
            allCommands[i].auto = false;
            allCommands[i].cmd = allCommands[i].cmd.replace('NA:', '');
        } else {
            allCommands[i].auto = true;
        }
        if (allCommands[i].cmd.substring(0, 13).indexOf('NT:') >= 0) {
            allCommands[i].trackoutput = 'TrackOutput:0,';
            allCommands[i].cmd = allCommands[i].cmd.replace('NT:', '');
        } else {
            allCommands[i].trackoutput = '';
        }
        allCommands[i].inputcmdblock = 'default';
        // Impulse command block
        if (allCommands[i].cmd.substring(0, 13).indexOf('I:') >= 0) {
            allCommands[i].inputcmdblock = 'impulse';
            allCommands[i].cmd = allCommands[i].cmd.replace('I:', '');
        }
        if (allCommands[i].cmd.substring(0, 13).indexOf('R:') >= 0) {
            allCommands[i].inputcmdblock = 'repeating';
            allCommands[i].cmd = allCommands[i].cmd.replace('R:', '');
        }
    }

    allInitCommands.reverse();
    for (i = 0; i < allCommands.length; i++) {
        nbtInSelectors(allCommands[i].cmd);
    }
    if (useHopperClock)
        allCommands.splice(0, 0, {
            cmd: "HOPPER1Placeholder"
        }, {
            cmd: "HOPPER2Placeholder"
        }, {
            cmd: "HOPPER3Placeholder"
        });

}

// floorCraftingScoreboard = makeRandomStr(5) + '_I';
floorCraftingCount = 0;
floorCraftingCurIndex = 1;

function makeRandomStr(strlength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < strlength; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function generateFloorCrafting(floorCraftingCommand) {
    var floorCraft = [];
    floorCraftingCommand = floorCraftingCommand + '  ';

    var startIndex = floorCraftingCurIndex;

    var floorCraftingCommandArr = [];
    var floorCraftingINITArr = [];

    var floorCraftingArguments = [];
    var prevMarker = 0;
    for (f = 0; f < floorCraftingCommand.length - 1; f++) {
        if (checkBrackets(floorCraftingCommand.substring(0, f + 1)) == 0 && floorCraftingCommand.substring(f, f + 1) == ' ') {
            floorCraftingArguments.push(floorCraftingCommand.substring(prevMarker, f));
            prevMarker = f + 1;
        }
    }

    floorCraftingArguments.splice(0, 1);

    // Retrieve the (optional) scoreboard name argument then remove it from the array (Not in use anymore since it is now definable in the options at the top of the page)
    // var inputScoreboard = '';
    // if (floorCraftingArguments.length % 3 !== 0) {
    // 	// If there is 1 or 2 extra arguments at the end
    // 	inputScoreboard = floorCraftingArguments[floorCraftingArguments.length - 1];
    // 	floorCraftingArguments.splice(floorCraftingArguments.length-2, 1);
    // 	floorCraftingCount = 0;
    // }
    // if (inputScoreboard.length <= 0) {
    // 	inputScoreboard = floorCraftingScoreboard;
    // }

    scoreboardObjInUse[0] = true;

    floorCraftingScoreboard = inputScoreboard + '_I';

    // if (floorCraftingCount <= 0) {
    // 	floorCraftingINITArr[floorCraftingINITArr.length] = {cmd: 'scoreboard objectives add ' + floorCraftingScoreboard + ' dummy', tag: 'init'};
    // }

    // At this point, the array only consists of the actual arguments
    var isResult = false;
    for (f = 0; f < floorCraftingArguments.length; f += 3) {
        isResult = false;
        if (floorCraftingArguments[f].substring(0, 4) == 'RES:') {
            isResult = true;
        }
        floorCraft.push({
            item: floorCraftingArguments[f].replace('RES:', ''),
            damage: floorCraftingArguments[f + 1],
            nbt: floorCraftingArguments[f + 2],
            isresult: isResult
        });
    }

    // At this point, the 'floorCraft' array holds objects of each item and it's settings
    var currentDamage = '';
    var currentNBT = '';
    var executeSelector = '';
    var oneIngDoneRad = '';

    for (f = 0; f < floorCraft.length; f++) {
        if (!floorCraft[f].isresult) {
            // Isn't a result item
            currentDamage = '';
            currentNBT = '';
            if (floorCraft[f].damage !== '0')
                currentDamage = ',Damage:' + floorCraft[f].damage + 's';
            if (floorCraft[f].nbt !== '{}')
                currentNBT = ',tag:' + floorCraft[f].nbt;
            floorCraftingCommandArr[floorCraftingCommandArr.length] = {
                cmd: 'scoreboard players set @e ' + floorCraftingScoreboard + ' ' + floorCraftingCurIndex + ' {item:{id:minecraft:' + floorCraft[f].item + currentDamage + currentNBT + '},OnGround:1b}',
                tag: 'none'
            };
            executeSelector = executeSelector + 'execute @e[score_' + floorCraftingScoreboard + '_min=' + floorCraftingCurIndex + ',score_' + floorCraftingScoreboard + '=' + floorCraftingCurIndex + oneIngDoneRad + '] ~ ~ ~ ';
            oneIngDoneRad = ',r=1';
            floorCraftingCurIndex++;
        }
    }

    for (f = 0; f < floorCraft.length; f++) {
        if (floorCraft[f].isresult) {
            // Is a result item
            currentDamage = '';
            currentNBT = '';
            if (floorCraft[f].damage !== '0')
                currentDamage = ',Damage:' + floorCraft[f].damage;
            if (floorCraft[f].nbt !== '{}')
                currentNBT = ',tag:' + floorCraft[f].nbt;
            floorCraftingCommandArr[floorCraftingCommandArr.length] = {
                cmd: executeSelector + 'summon item ~ ~0.5 ~ {item:{id:minecraft:' + floorCraft[f].item + currentDamage + currentNBT + ',Count:1}}',
                tag: 'none'
            };
            floorCraftingCommandArr[floorCraftingCommandArr.length] = {
                cmd: executeSelector + 'kill @e[type=item,r=3,score_' + floorCraftingScoreboard + '_min=' + startIndex + ',score_' + floorCraftingScoreboard + '=' + floorCraftingCurIndex + ']',
                tag: 'none'
            };
        }
    }

    floorCraftingCount += 1;

    return {
        reg: floorCraftingCommandArr,
        init: floorCraftingINITArr
    };
}

function formatEscaping() {
    for (i = 0; i < allCommands.length; i++) {
        allCommands[i].cmd = allCommands[i].cmd.replace(/\\/g, '\\\\');
        allCommands[i].cmd = allCommands[i].cmd.replace(/"/g, '\\"');
        allCommands[i].cmd = allCommands[i].cmd.replace(/\\/g, '\\\\');
        allCommands[i].cmd = allCommands[i].cmd.replace(/"/g, '\\"');
    }
    for (i = 0; i < allInitCommands.length; i++) {
        allInitCommands[i].cmd = allInitCommands[i].cmd.replace(/\\/g, '\\\\');
        allInitCommands[i].cmd = allInitCommands[i].cmd.replace(/"/g, '\\"');
    }
}

function calculateBoxEdge(side, maxOrMin) {
    var size = 0;
    predictAmountOfCmds = allCommands.length;
    if (side == 'length') {
        // Get size (no offsets yet)
        size = boxLengthX;
        if (predictAmountOfCmds < size) {
            size = predictAmountOfCmds;
        }

        // Convert size to min and max coordinates
        if (maxOrMin == 'min') {
            return 2;
        } else {
            return 2 + size;
        }
    } else if (side == 'width') {
        // Get size (no offsets yet)
        size = boxLengthZ;
        if (predictAmountOfCmds / boxLengthX < size) {
            size = Math.ceil(predictAmountOfCmds / boxLengthX);
        }

        // Convert size to min and max coordinates
        if (maxOrMin == 'min') {
            if (size % 2 == 0) {
                size -= 1;
            }
            return -Math.floor(size / 2);
        } else {
            return Math.floor(size / 2);
        }
    } else if (side == 'height') {
        // Get size (no offsets yet)
        size = 999;
        if ((predictAmountOfCmds - 1) / boxLengthX < size) {
            size = Math.floor((predictAmountOfCmds - 1) / boxLengthX / boxLengthZ);
        }

        // Convert size to min and max coordinates
        if (maxOrMin == 'min') {
            return -2;
        } else {
            return size - 2;
        }
    }
}

function addDataIfNone(blockId) {
    if (blockId.indexOf(' ') <= -1) {
        return blockId + ' 0';
    } else {
        return blockId;
    }
}

function rotateCaseNegate(axis) {
    if (axis == 'x') {
        caseSides.min[0] *= -1;
        caseSides.max[0] *= -1;
        caseCaps.min[0] *= -1;
        caseCaps.max[0] *= -1;
    } else {
        caseSides.min[2] *= -1;
        caseSides.max[2] *= -1;
        caseCaps.min[2] *= -1;
        caseCaps.max[2] *= -1;
    }
}

function rotateCaseSwap() {
    tempCaseCoords.tempCaseSides = [caseSides.min[0], caseSides.min[1], caseSides.min[2], caseSides.max[0], caseSides.max[1], caseSides.max[2]];
    tempCaseCoords.tempCaseCaps = [caseCaps.min[0], caseCaps.min[1], caseCaps.min[2], caseCaps.max[0], caseCaps.max[1], caseCaps.max[2]];
    // Casesides min swapping
    caseSides.min[0] = tempCaseCoords.tempCaseSides[2];
    caseSides.min[2] = tempCaseCoords.tempCaseSides[0];
    // Casesides max swapping
    caseSides.max[0] = tempCaseCoords.tempCaseSides[5];
    caseSides.max[2] = tempCaseCoords.tempCaseSides[3];

    // Casecaps min swapping
    caseCaps.min[0] = tempCaseCoords.tempCaseCaps[2];
    caseCaps.min[2] = tempCaseCoords.tempCaseCaps[0];
    // Casecaps max swapping
    caseCaps.max[0] = tempCaseCoords.tempCaseCaps[5];
    caseCaps.max[2] = tempCaseCoords.tempCaseCaps[3];
}

// Declare these 3 variables globally
caseSides = {};
caseCaps = {};
tempCaseCoords = {};

function generateCasing(sides, caps, orientation, offsetX, offsetY, offsetZ) {
    if ($('#option-box-encase').is(':checked') == false) {
        return;
    }
    // First, get the min and max values for the casing
    caseSides = {
        min: [calculateBoxEdge('length', 'min') + offsetX, calculateBoxEdge('height', 'min') + offsetY, (calculateBoxEdge('width', 'min') - 1 + offsetZ)],
        max: [(calculateBoxEdge('length', 'max') + 1 + offsetX), calculateBoxEdge('height', 'max') + offsetY, (calculateBoxEdge('width', 'max') + 1 + offsetZ)]
    };

    caseCaps = {
        min: [calculateBoxEdge('length', 'min') + offsetX, (calculateBoxEdge('height', 'min') - 1 + offsetY), (calculateBoxEdge('width', 'min') - 1 + offsetZ)],
        max: [(calculateBoxEdge('length', 'max') + 1 + offsetX), (calculateBoxEdge('height', 'max') + 1 + offsetY), (calculateBoxEdge('width', 'max') + 1 + offsetZ)]
    };

    // Rotation based on input orientation
    tempCaseCoords = {};
    if (orientation == 2) {
        rotateCaseNegate('x');
        rotateCaseNegate('z');
    } else if (orientation == 3) {
        rotateCaseSwap();
        rotateCaseNegate('x');
    } else if (orientation == 4) {
        rotateCaseSwap();
        rotateCaseNegate('z');
    }

    // Fills in the sides of the box (usually glass)
    allInitCommands[allInitCommands.length] = {
        cmd: ('fill ~' + caseSides.min[0] + ' ~' + caseSides.min[1] + ' ~' + caseSides.min[2] + ' ~' + caseSides.max[0] + ' ~' + caseSides.max[1] + ' ~' + caseSides.max[2] + ' ' + addDataIfNone(sides) + ' 0 ' + caps.split(' ')[0]),
        tag: 'init'
    };

    // Fills in the top and bottom caps of the box (stained clay by default)
    allInitCommands[allInitCommands.length] = {
        cmd: ('fill ~' + caseCaps.min[0] + ' ~' + caseCaps.min[1] + ' ~' + caseCaps.min[2] + ' ~' + caseCaps.max[0] + ' ~' + caseCaps.max[1] + ' ~' + caseCaps.max[2] + ' ' + addDataIfNone(caps) + ' hollow'),
        tag: 'init'
    };

    // .splice(1, 0, 
}

function generateCoordinates(maxLength, maxWidth) {
    // maxLength is the maximum amount of command blocks along the X axis. maxWidth is how far across the Z axis before it goes upwards.
    var condReady = false;
    var condOutOfBounds = false;
    var maxLengthFork = boxLengthX;
    maxWidth -= 1;

    var currentX = 0;
    var currentY = 0;
    var currentZ = 0;

    if (boxLengthX < 4)
        boxLengthX = 4;

    $('#output-notifications').hide();

    while (!condReady || condOutOfBounds) {
        currentX = 0;
        currentY = 0;
        currentZ = 0;

        maxLengthFork = boxLengthX - 1;

        for (i = 0; i < allCommands.length; i++) {
            if (allCommands[i].tag !== 'init') {
                if ((!useHopperClock && i == 0) || (useHopperClock && i == 3)) {
                    // Make the first command be a repeating command block
                    allCommands[i].repeating = true;
                }
                if (useHopperClock && i == 0) {
                    // The first 2 command blocks should be hoppers instead.
                    allCommands[i].tag = 'hopper1';
                }
                if (useHopperClock && i == 1) {
                    // The first 2 command blocks should be hoppers instead.
                    allCommands[i].tag = 'hopper2';
                }
                if (useHopperClock && i == 2) {
                    // The first 2 command blocks should be hoppers instead.
                    allCommands[i].tag = 'hopper3';
                }

                allCommands[i].posX = currentX;
                allCommands[i].posY = currentY;
                allCommands[i].posZ = currentZ;

                // Calculate the direction that it should be facing.
                if (currentZ % 2 == 0 && currentY % 2 == 0 || currentZ % 2 !== 0 && currentY % 2 !== 0) {
                    // All even Z rows on the even Y heights
                    allCommands[i].direction = 'east';
                    currentX += 1;
                }
                if (currentZ % 2 == 0 && currentY % 2 !== 0 || currentZ % 2 !== 0 && currentY % 2 == 0) {
                    // All even Z rows on the odd Y heights
                    allCommands[i].direction = 'west';
                    currentX -= 1;
                }

                if (currentX < 0) {
                    if (currentY % 2 == 0) {
                        allCommands[i].direction = 'south';
                        currentZ += 1;
                    } else {
                        allCommands[i].direction = 'north';
                        currentZ -= 1;
                    }

                    currentX = 0;
                }

                if (currentX > maxLengthFork) {
                    // When it reaches the max length (X), it should go up on the Z axis.
                    if (currentY % 2 == 0) {
                        allCommands[i].direction = 'south';
                        currentZ += 1;
                    } else {
                        allCommands[i].direction = 'north';
                        currentZ -= 1;
                    }

                    currentX -= 1;
                }

                if (currentZ > maxWidth) {
                    // When it reaches the max width (Z), it should go up on the Y axis.
                    allCommands[i].direction = 'up';

                    currentY += 1;
                    currentZ -= 1;
                }

                if (currentZ < 0) {
                    // When it is on an odd Y coordinate, it will go up once the Z value is below 0.
                    allCommands[i].direction = 'up';

                    currentY += 1;
                    currentZ = 0;
                }
            } else {
                // If it's an init command, it doesn't need a direction, but it should have all coordinates set to 0 to prevent errors
                allCommands[i].posX = 0;
                allCommands[i].posY = 0;
                allCommands[i].posZ = 0;
            }
        }

        // // Check if the conditional chains are good
        // for (i = 1; i < allCommands.length; i++) {
        // 	if (allCommands[i-1].tag!='do' && allCommands[i].tag=='do' && allCommands[i-1].tag!=='init' && allCommands[i].direction!=allCommands[i-1].direction) {
        // 		allCommands.splice(i-1, 0, {cmd:'',tag:'none'});
        // 		i++;
        // 	}
        // }
        // condReady = true;
        // for (i = 1; i < allCommands.length; i++) {
        // 	if (allCommands[i-1].tag!=='do' && allCommands[i].tag=='do' && allCommands[i-1].tag!=='init' && allCommands[i].direction!=allCommands[i-1].direction)
        // 		condReady = false;
        // }

        // if (condReady) {
        // 	condOutOfBounds = false;
        // 	for (i = 1; i < allCommands.length; i++) {
        // 		if (allCommands[i-1].tag=='do' && allCommands[i].tag=='do' && allCommands[i-1].direction!=allCommands[i].direction) {
        // 			condOutOfBounds = true;
        // 			boxLengthX++;
        // 		}
        // 	}
        // }

        condReady = true;
        condOutOfBounds = false;

    }
    if (condOutOfBounds) {
        $('#output-notifications').show().html('The box length was automatically increased in order to keep the conditional chain intact.');
    }
}

function dirToDamage(direction, isConditional) {
    var damageDir = 0;
    switch (direction) {
        case 'down':
            damageDir = 0;
            break;
        case 'up':
            damageDir = 1;
            break;
        case 'north':
            damageDir = 2;
            break;
        case 'south':
            damageDir = 3;
            break;
        case 'west':
            damageDir = 4;
            break;
        case 'east':
            damageDir = 5;
            break;
    }

    // To make it a condition cmdblock, it should have 8 added to its damage.
    if (isConditional == true) {
        damageDir += 8;
    }

    return damageDir;
}

function tagConditionals() {
    // Returns 'true' if the command index specified is going to be a conditional block
    for (i = 0; i < allCommands.length; i++) {
        if (allCommands[i].tag == 'do') {
            allCommands[i].isCond = true;
        }
    }
}

function generateBrackets() {
    var bracketString = '';
    for (i = 0; i < allCommands.length + allInitCommands.length; i++) {
        bracketString += '}]';
    }
    return bracketString;
}

var useBlockdata = true;

function optionBlockdataChange() {
    useBlockdata = !useBlockdata;
}


//OLD CODE CHEWEY REMOVE
function shortHand(check) {
    //https://regex101.com
    //http://stackoverflow.com/questions/25249535/regex-match-string-until-whitespace-javascript
    return check.map(function(current) {
        var stonetype
        console.log(current);
        return current.replace(/stone *variant=([^\s]*)/gi, (function(a, b) {
            b = b.toLowerCase()
            console.log(b);
            switch (b) {
                case 'stone':
                    stonetype = 'stone'
                    break;
                case 'granite':
                    stonetype = 'stone 1'
                    break;
                case 'smooth_granite':
                case 'smooth granite':
                case 'polished granite':
                case 'polished_granite':
                    stonetype = 'stone 2'
                    break;
                case 'diorite':
                    stonetype = 'stone 3'
                    break;
                case 'smooth_diorite':
                case 'smooth diorite':
                case 'polished diorite':
                case 'polished_diorite':
                    stonetype = 'stone 4'
                    break;
                case 'andesite':
                    stonetype = 'stone 5'
                    break;
                case 'smooth_andesite':
                case 'smooth andesite':
                case 'polished andesite':
                case 'polished_andesite':
                    stonetype = 'stone 6'
                    break;
                case 'cobblestone':
                    stonetype = 'cobblestone'
                    break;
                default:
                    stonetype = 'stone'
            }
            console.log(stonetype);
            return stonetype
        }))
    })
}

function generateOutputCommand() {
    var initCmdString = '';
    var typeString = '';
    tagConditionals();
    var finalInitCmdArray = [];
    var doNormalProcedure = true;
    var autoString = '';

    for (var i = 0; i < allCommands.length; i++) {
        doNormalProcedure = true;
        if (allCommands[i].tag == 'hopper1') {
            // This item is the first hopper, which should hold the item from the start.
            doNormalProcedure = false;
            finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' hopper ' + dirToDamage(fixDirForOrientation("east", parseInt($('#structure-orientation-input').val())), false) + ' replace {items:[{id:minecraft:stone,Count:1}]}}';

        } else if (allCommands[i].tag == 'hopper2') {
            allCommands[i].direction == 'west';
            // This item is the first hopper, which should hold the item from the start.
            doNormalProcedure = false;
            finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' hopper ' + dirToDamage(fixDirForOrientation("west", parseInt($('#structure-orientation-input').val())), false) + '}';

        } else if (allCommands[i].tag == 'hopper3') {
            allCommands[i].direction == 'east';
            // This item is the first hopper, which should hold the item from the start.
            doNormalProcedure = false;
            finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' unpowered_comparator ' + dirToDamageComparator(fixDirForOrientation("east", parseInt($('#structure-orientation-input').val()))) + '}';

        } else {
            if (allCommands[i].repeating == true) {
                if (useHopperClock) {
                    // Using a hopper clock instead, so it should be an impulse (regular) command block
                    typeString = '';
                } else {
                    // Normal, 20hz repeat clock
                    typeString = 'repeating_';
                }
            } else {
                typeString = 'chain_';
            }
            if (allCommands[i].inputcmdblock == 'impulse') {
                typeString = '';
            }
            if (allCommands[i].inputcmdblock == 'repeating') {
                typeString = 'repeating_';
            }
        }

        autoString = '';
        if (!useHopperClock) {
            if (allCommands[i].auto == true && allCommands[i].cmd.length > 0)
                autoString = 'auto:1,';
        } else {
            if (i == 3) {
                autoString = '';
            } else {
                autoString = 'auto:1,';
            }
        }

        if (doNormalProcedure) {
            if (allCommands[i].cmd.length > 0) {
                var commandQuoteWrap = '';
                if (allCommands[i].cmd.indexOf('"') > -1) {
                    commandQuoteWrap = '"';
                }

                if (useBlockdata) {
                    finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:blockdata ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' {' + autoString + allCommands[i].trackoutput + 'Command:' + commandQuoteWrap + allCommands[i].cmd + commandQuoteWrap + '}}';
                } else {
                    finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' ' + typeString + 'command_block ' + dirToDamage(allCommands[i].direction, allCommands[i].isCond) + ' 0 {' + autoString + allCommands[i].trackoutput + 'Command:' + commandQuoteWrap + allCommands[i].cmd + commandQuoteWrap + '}}';
                }

            } else {
                // Omit the Command:"" part if there is no command specified
                if (useBlockdata) {
                    //finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:blockdata ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' ' + typeString + 'command_block ' + dirToDamage(allCommands[i].direction, allCommands[i].isCond) + '}';
                    // There doesn't have to be anything here for the blockdata version since the command blocks are already placed using /fill
                } else {
                    finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' ' + typeString + 'command_block ' + dirToDamage(allCommands[i].direction, allCommands[i].isCond) + '}';
                }

            }
        }
    }


    // This section is after the block of code above so that it can be ensured that the /fill commands are executed before the blockdata commands
    if (useBlockdata) {
        // Create /fill commands to place command blocks beforehand

        var lowestCorner = {
            x: 9999,
            y: 9999,
            z: 9999
        };

        var highestCorner = {
            x: -9999,
            y: -9999,
            z: -9999
        };

        for (var i = 0; i < allCommands.length; i++) {

            // Update lowest corner if this one is lower
            if (allCommands[i].posX < lowestCorner.x)
                lowestCorner.x = allCommands[i].posX;
            if (allCommands[i].posY < lowestCorner.y)
                lowestCorner.y = allCommands[i].posY;
            if (allCommands[i].posZ < lowestCorner.z)
                lowestCorner.z = allCommands[i].posZ;

            // Update highest corner if this one is higher
            if (allCommands[i].posX > highestCorner.x)
                highestCorner.x = allCommands[i].posX;
            if (allCommands[i].posY > highestCorner.y)
                highestCorner.y = allCommands[i].posY;
            if (allCommands[i].posZ > highestCorner.z)
                highestCorner.z = allCommands[i].posZ;

        }

        var firstCmdBlockDir = dirToDamage(allCommands[0].direction, false);

        // Command blocks that are 'different':
        for (var i = 0; i < allCommands.length; i++) {

            if (allCommands[i].direction !== allCommands[0].direction || allCommands[i].repeating === true || allCommands[i].inputcmdblock === 'impulse' || allCommands[i].inputcmdblock === 'repeating' || allCommands[i].isCond === true) {

                var typeString = '';

                if (allCommands[i].repeating == true) {
                    if (useHopperClock) {
                        // Using a hopper clock instead, so it should be an impulse (regular) command block
                        typeString = '';
                    } else {
                        // Normal, 20hz repeat clock
                        typeString = 'repeating_';
                    }
                } else {
                    typeString = 'chain_';
                }
                if (allCommands[i].inputcmdblock == 'impulse') {
                    typeString = '';
                }
                if (allCommands[i].inputcmdblock == 'repeating') {
                    typeString = 'repeating_';
                }

                if (allCommands[i + 1] !== undefined && allCommands[i].direction === allCommands[i + 1].direction && allCommands[i].isCond === allCommands[i + 1].isCond && allCommands[i].inputcmdblock === allCommands[i + 1].inputcmdblock && allCommands[i].repeating === allCommands[i + 1].repeating) {
                    // The next command block in the array has the same basic type as the current one. Combine into a /fill command

                    var checkContinuous = 1;

                    while (allCommands[i + checkContinuous] !== undefined && allCommands[i].direction === allCommands[i + checkContinuous].direction && allCommands[i].isCond === allCommands[i + checkContinuous].isCond && allCommands[i].inputcmdblock === allCommands[i + checkContinuous].inputcmdblock && allCommands[i].repeating === allCommands[i + checkContinuous].repeating) {
                        checkContinuous++;
                    }

                    checkContinuous--;

                    finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:fill ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' ~' + allCommands[i + checkContinuous].posX + ' ~' + allCommands[i + checkContinuous].posY + ' ~' + allCommands[i + checkContinuous].posZ + ' ' + typeString + 'command_block ' + dirToDamage(allCommands[i].direction, allCommands[i].isCond) + '}';

                    i += checkContinuous; // skip all of the command blocks that were already included in this /fill command

                } else {

                    finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:setblock ~' + allCommands[i].posX + ' ~' + allCommands[i].posY + ' ~' + allCommands[i].posZ + ' ' + typeString + 'command_block ' + dirToDamage(allCommands[i].direction, allCommands[i].isCond) + '}';

                }

            }

        }

        // MIGHT HAVE TO CHANGE THIS TO A .SPLICE() AT THE BEGINNING OF THE ARRAY
        finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:fill ~' + lowestCorner.x + ' ~' + lowestCorner.y + ' ~' + lowestCorner.z + ' ~' + highestCorner.x + ' ~' + highestCorner.y + ' ~' + highestCorner.z + ' chain_command_block ' + firstCmdBlockDir + '}';

    }


    // Generate the initCmdString, which is used in the final command
    for (i = 0; i < allInitCommands.length; i++) {
        if (allInitCommands[i].tag == 'sign' || (allInitCommands[i].cmd.indexOf('"') === -1 && allInitCommands[i].cmd.indexOf("'") === -1)) {
            finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:' + allInitCommands[i].cmd + '}';
        } else {
            finalInitCmdArray[finalInitCmdArray.length] = ',{id:commandblock_minecart,Command:"' + allInitCommands[i].cmd + '"}';
        }
    }

    // Check conditional chains
    var previousTag = 'none'; // placeholder; default
    var previousY = 0;
    var previousZ = 0;

    for (i = 0; i < allCommands.length; i++) {

        if (allCommands[i].tag == 'do' && (allCommands[i].posY !== previousY || allCommands[i].posZ !== previousZ)) {
            $('#option-box-length-x').val(parseInt($('#option-box-length-x').val()) + 2);

            generateCompactCommand();

            $('#output-notifications').show().html('The box length was automatically increased in order to keep the conditional chain intact.');

            return;
        }

        previousTag = allCommands[i].tag;
        previousY = allCommands[i].posY;
        previousZ = allCommands[i].posZ;

    }

    // Had to put every entity into an array then reverse it because of the Passengers tag
    finalInitCmdArray = finalInitCmdArray.reverse();

    outputCommands = [];

    var outputTemplate = 'summon falling_block ~ ~1 ~ {Block:stone,Time:1,Passengers:[{id:falling_block,Block:redstone_block,Time:1,Passengers:[{id:falling_block,Block:activator_rail,Time:1,Passengers:[{id:commandblock_minecart,Command:gamerule commandBlockOutput false}&&INITCMDSTRING&&,{id:commandblock_minecart,Command:setblock ~ ~ ~1 command_block 0 0 {Command:fill ~ ~-3 ~-1 ~ ~ ~ air}},{id:commandblock_minecart,Command:setblock ~ ~-1 ~1 redstone_block},{id:commandblock_minecart,Command:kill @e[type=commandblock_minecart,r=1]}]}]}]}';

    for (i = 0; i < finalInitCmdArray.length; i++) {
        if (initCmdString.length + finalInitCmdArray[i].length + 492 + 89 > 32500) {
            initCmdString += ',{id:commandblock_minecart,Command:summon falling_block ~ ~2 ~ {Block:command_block,Time:1}}';
            outputCommands[outputCommands.length] = outputTemplate.replace('&&INITCMDSTRING&&', initCmdString);
            initCmdString = '';
        }

        initCmdString += finalInitCmdArray[i];
    }

    if (initCmdString.length > 0) {
        outputCommands[outputCommands.length] = outputTemplate.replace('&&INITCMDSTRING&&', initCmdString);
    }

    // var outputCommand = '/summon commandblock_minecart ~ ~1 ~ {Command:kill @e[type=commandblock_minecart,r=1],Riding:{id:commandblock_minecart,Command:setblock ~ ~-1 ~1 redstone_block,Riding:{id:commandblock_minecart,Command:setblock ~ ~ ~1 command_block 0 replace {Command:fill ~ ~-3 ~-1 ~ ~ ~ air},Riding:{' + initCmdString + 'id:commandblock_minecart,Command:gamerule commandBlockOutput false,Riding:{id:commandblock_minecart,Riding:{id:falling_block,Block:activator_rail,Time:1,Riding:{id:falling_block,Block:redstone_block,Time:1,Riding:{id:falling_block,Block:stone,Time:1}}}}}}}}' + generateBrackets();

    // var outputCommand = 'summon falling_block ~ ~1 ~ {Block:stone,Time:1,Passengers:[{id:falling_block,Block:redstone_block,Time:1,Passengers:[{id:falling_block,Block:activator_rail,Time:1,Passengers:[{id:commandblock_minecart,Command:gamerule commandBlockOutput false}' + initCmdString + ',{id:commandblock_minecart,Command:setblock ~ ~ ~1 command_block 0 replace {Command:fill ~ ~-3 ~-1 ~ ~ ~ air}},{id:commandblock_minecart,Command:setblock ~ ~-1 ~1 redstone_block},{id:commandblock_minecart,Command:kill @e[type=commandblock_minecart,r=1]}]}]}]}'; // 492 characters, not counting anything but the pure string


    displayOutputError(false);

    $('#output-container').empty();

    for (var i = 0; i < outputCommands.length; i++) {
        // outputCommands[i]
        outputCommands[i] = outputCommands[i].replace(/~0 /g, '~ ');
        $('#output-container').append("<textarea cols='50' rows='1' readonly class='output-command' onclick='this.focus();this.select()'></textarea><div class='output-stats'></div>");
        $('.output-command').last().val(outputCommands[i]).css('display', 'inline-block');
        $('.output-stats').last().html('Command Length: ' + outputCommands[i].length).slideDown(150);

        if (outputCommands[i].length > 32500) {
            displayOutputError('The character limit for command blocks was lowered to 32,500 in the 1.9 snapshots! This command is ' + (outputCommands[i].length - 32500) + ' characters over that limit!');
        }

        if (checkBrackets(outputCommands[i]) !== 0) {
            if (checkBrackets(outputCommands[i]) > 0) {
                highlightUnbalancedCmd('opening', outputCommands[i]);
            } else {
                highlightUnbalancedCmd('closing', outputCommands[i]);
            }
        }
    }
}

function displayOutputError(errorText) {
    if (errorText == false) {
        $('#output-errors').hide();
        return;
    }
    $('#output-errors').empty();
    var lineBreak = '';
    if ($('#output-errors').val().length > 0) {
        lineBreak = '<br>';
    }
    $('#output-errors').append(errorText + lineBreak).slideDown(200);
}

displayBracketBalanceErrors = true;

function highlightUnbalancedCmd(type, outputCmd) {
    if (!displayBracketBalanceErrors) {
        return;
    }
    var inputCommands = $('#input-commands').val();
    var isActuallyUnbalanced = false;
    inputCommandsArray = inputCommands.split(getDelimiter());
    for (j = inputCommandsArray.length - 1; j >= 0; j--) {
        // Find the command(s) that are unbalanced
        if (inputCommandsArray[j].substring(0, 2).indexOf('#') < 0 && inputCommandsArray[j].length > 0) {
            // Only if not a comment line
            var tarea = document.getElementById('input-commands');
            if (type == 'opening' && checkBrackets(inputCommandsArray[j]) > 0) {
                selectTextareaLine(tarea, j + 1);
                isActuallyUnbalanced = true;
            }
            if (type == 'closing' && checkBrackets(inputCommandsArray[j]) < 0) {
                selectTextareaLine(tarea, j + 1);
                isActuallyUnbalanced = true;
            }
        }
    }
    if (isActuallyUnbalanced) {
        if (checkBrackets(outputCmd) !== 0) {
            if (checkBrackets(outputCmd) > 0) {
                displayOutputError('There are ' + checkBrackets(outputCmd) + ' too many opening curly brackets in the final command! The command causing the error has been highlighted. <div id="ignore-unbalanced">Ignore from now on</div>');
            } else {
                displayOutputError('There are ' + Math.abs(checkBrackets(outputCmd)) + ' too many closing curly brackets in the final command! The command causing the error has been highlighted. <div id="ignore-unbalanced">Ignore from now on</div>');
            }
            $('#ignore-unbalanced').click(function() {
                displayBracketBalanceErrors = false;
                $('#output-errors').slideUp().empty();
                $('#output-notifications').slideDown().html('The "unbalanced brackets" error will be ignored from now on.');
                setTimeout(function() {
                    $('#output-notifications').fadeOut();
                }, 3000);
            })
        }
    }
}

function selectTextareaLine(tarea, lineNum) {
    lineNum--; // array starts at 0
    var lines = tarea.value.split(getDelimiter());

    // calculate start/end
    var startPos = 0,
        endPos = tarea.value.length;
    for (var x = 0; x < lines.length; x++) {
        if (x == lineNum) {
            break;
        }
        startPos += (lines[x].length + 1);

    }

    var endPos = lines[lineNum].length + startPos;

    // do selection
    // Chrome / Firefox

    if (typeof(tarea.selectionStart) != "undefined") {
        tarea.focus();
        tarea.selectionStart = startPos;
        tarea.selectionEnd = endPos;
        return true;
    }

    // IE
    if (document.selection && document.selection.createRange) {
        tarea.focus();
        tarea.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
        return true;
    }

    return false;
}

function checkBrackets(command) {
    return (command.split('{').length - 1) - (command.split('}').length - 1);
}

function getBoxSize(side) {
    var maxVal = -999;
    var minVal = 999;
    for (i = 0; i < allCommands.length; i++) {
        if (side == 'length') {
            if (allCommands[i].posX > maxVal) {
                maxVal = allCommands[i].posX;
            }
            if (allCommands[i].posX < minVal) {
                minVal = allCommands[i].posX;
            }
        } else if (side == 'width') {
            if (allCommands[i].posZ > maxVal) {
                maxVal = allCommands[i].posZ;
            }
            if (allCommands[i].posZ < minVal) {
                minVal = allCommands[i].posZ;
            }
        }
    }
    return maxVal - minVal;
}

function offsetCoordinates(offsetX, offsetY, offsetZ, orientation) {
    // Simply offsets the coordinates if specified by the user. Just in a separate function to clean things up.
    // Since this function should always run before the generateRotatedCoordinates() function,
    // it should add 2 to the X offset, so it doesn't build the machine inside the starting stack.
    offsetX += 3;
    offsetY -= 2;
    offsetZ = -Math.floor(getBoxSize('width') / 2) + offsetZ;
    for (i = 0; i < allCommands.length; i++) {
        allCommands[i].posX += offsetX;
        allCommands[i].posY += offsetY;
        allCommands[i].posZ += offsetZ;
    }
}

function rotateDirectionCommandBlocks(rotation) {
    // Rotation key:   1 = 90   2 = 180   3 = 270
    var newdir = 0;
    while (rotation > 0) {
        for (i = 0; i < allCommands.length; i++) {
            switch (allCommands[i].direction) {
                case 'north':
                    newdir = 'east';
                    break;
                case 'east':
                    newdir = 'south';
                    break;
                case 'south':
                    newdir = 'west';
                    break;
                case 'west':
                    newdir = 'north';
                    break;
                default:
                    newdir = allCommands[i].direction;
            }
            allCommands[i].direction = newdir;
        }
        rotation -= 1;
    }
}

function rotateDirection(direction, rotation) {
    // Rotation key:   1 = 90   2 = 180   3 = 270
    var newdir = direction;
    while (rotation > 0) {
        switch (newdir) {
            case 'north':
                newdir = 'east';
                break;
            case 'east':
                newdir = 'south';
                break;
            case 'south':
                newdir = 'west';
                break;
            case 'west':
                newdir = 'north';
        }
        rotation -= 1;
    }
    return newdir;
}

function fixDirForOrientation(direction, orientation) {
    // Orientation key (copy of it):   1 = X+   2 = X-   3 = Z+   4 = Z-
    if (orientation == 1)
        return direction;
    if (orientation == 2)
        return rotateDirection(direction, 2);
    if (orientation == 3)
        return rotateDirection(direction, 1);
    if (orientation == 4)
        return rotateDirection(direction, 3);
}

function dirToDamageComparator(direction) {
    switch (direction) {
        case 'north':
            return 0;
        case 'east':
            return 1;
        case 'south':
            return 2;
        case 'west':
            return 3;
    }
}

function rotateSegSwap() {
    var tempCommandTray = [];
    // First put all commands in temp command tray
    for (i = 0; i < allCommands.length; i++) {
        tempCommandTray[i] = {
            cmd: allCommands[i].cmd,
            oldPosX: allCommands[i].posX,
            oldPosZ: allCommands[i].posZ
        };
    }
    // Then, swap the x with the y positions
    for (i = 0; i < tempCommandTray.length; i++) {
        allCommands[i].posX = tempCommandTray[i].oldPosZ;
        allCommands[i].posZ = tempCommandTray[i].oldPosX;
    }
}

function rotateSegNegate(axis) {
    if (axis == 'x') {
        for (i = 0; i < allCommands.length; i++) {
            allCommands[i].posX *= -1;
        }
    } else {
        for (i = 0; i < allCommands.length; i++) {
            allCommands[i].posZ *= -1;
        }
    }
}

function generateRotatedCoordinates(orientation) {
    // Orientation key:   1 = X+   2 = X-   3 = Z+   4 = Z-
    // By default, make it oriented towards X+, then swap them and negate if needed


    var tempCommandTray = [];
    if (orientation == 2) {
        rotateSegNegate('x');
        rotateSegNegate('z');
        rotateDirectionCommandBlocks(2);
    } else if (orientation == 3) {
        rotateSegSwap();
        rotateDirectionCommandBlocks(1);
        rotateSegNegate('x');
    } else if (orientation == 4) {
        rotateSegSwap();
        rotateSegNegate('z');
        rotateDirectionCommandBlocks(3);
    }
}



$('#upload-textfile').click(function() {
    document.getElementById("upload-hidden-button").click();
});

document.getElementById("upload-hidden-button").onchange = function() {
    var file = document.getElementById("upload-hidden-button").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(evt) {
            importWithResultMessage(evt.target.result);
        }
        reader.onerror = function(evt) {
            $('#project-error').html('The project file that was uploaded is not valid!');
        }
    }
}

$('#export-download').click(function() {
    download('cmdcombiner-project.txt', $('#export-textarea').val());
});

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


$('#button-save-simple').click(function() {
    saveProjectSimple();
});


$('#sign-collapse').click(function() {
    $('#sign-wrapper').slideToggle();
    $('#sign-collapse').toggleClass('sign-collapse-rotate');
});