'use strict';
var grunt = require('grunt');

var RegexCheck = function (pattern, listOfExcludedFiles, gruntLog, gruntFile, negative) {
    var log = gruntLog;
    var file = gruntFile;

    var excludedFiles = listOfExcludedFiles || [];
    if (pattern === undefined) {
        throw "Configuration option 'pattern' was not specified";
    }
    if (typeof pattern !== 'object') {
        throw "Configuration option 'pattern' should be a javascript regular expression";
    }

    if (negative === undefined) {
        negative = false;
    }

    var isExcluded = function (filepath) {
        var isExcluded = false;
        excludedFiles.forEach(function (excludedFile) {
            if (excludedFile === filepath) {
                isExcluded = true;
            }
        });
        return isExcluded;
    };

    return {
        check: function (files) {
            var ranOnce = false;

            files.forEach(function (f) {
                var matchingFiles = f.src.filter(function (filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!file.exists(filepath)) {
                        log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function (filepath) {
                    ranOnce = true;
                    var source = file.read(filepath);
                    var match = source.match(pattern);

                    return {
                      filepath: filepath,
                      match: match,
                      isNotExcluded: !isExcluded(filepath, excludedFiles)
                    };
                }).filter(function (result) {
                        if(result.isNotExcluded)
                        {
                            if(negative) 
                                return result.match === null;
                            else
                                return result.match !== null;

                        } else {
                            return false;
                        }
 
                    });

                if (matchingFiles.length === 0) {
                    log.writeln('grunt-regex-check passed');
                } else {

                    if(negative)
                    {
                        var filesMessages = matchingFiles.map(function (matchingFile) {
                          return matchingFile.filepath + " - failed because it didn't match '" + pattern + "'";
                        }).join('\n');

                        grunt.fail.warn("The following files contained unwanted patterns:\n\n" + filesMessages +
                            "\n\nFiles that were excluded:\n" + excludedFiles.join('\n'));

                    } else {
                        var filesMessages = matchingFiles.map(function (matchingFile) {
                          return matchingFile.filepath + " - failed because it matched '" + pattern + "'";
                        }).join('\n');
                        
                        grunt.fail.warn("The following files contained unwanted patterns:\n\n" + filesMessages +
                            "\n\nFiles that were excluded:\n" + excludedFiles.join('\n'));

                    }
                }

            });
            if(!ranOnce) {
                log.warn("No files were processed. You may want to check your configuration. Files detected: " + files.join(','));
            }
        }
    };
};


module.exports = RegexCheck;


