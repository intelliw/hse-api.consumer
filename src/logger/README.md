# Logger Framework 
_Logger provides a wrapper over Stackdriver's multiple APIs (`Logging`, `Error Reporting`, `Tracing`)_

_it decouples constituent parts of the logging process (output (`appenders`), content (`verbosity`), coverage (`statements`) and makes these configurable and extensible_

_Logger can be configured differently in each environment_

## configurables
_Logger can be configured through these instruments_

`environment`
    `enums.js`   -   enumerations for   `logging`, `features`
    `env.js`     -   configurations per environment for  `logging`, `features`, `stackdriver` 

_these configuratioons are described below_ 

### env.LOGGING configuration
```json
    env._LOGGING: {
            "statements": [ enums.logging.statements ],
            "verbosity": [ enums.logging.verbosity ],
            "appenders": [ enums.logging.appenders ]
        }
```
__statements__      determines which statements in the code will be logged. 
__verbosity__       determines whether logging _content_ is `info`, `debug`, or `none`
                    if verbosity is set to 'none' all logging is effectively turned off
                    only one of the three options are applicable: 
                        `none` overrides `debug` which overrides `info`.
__appenders__       determines whether logging _output_ is sent to `stackdriver`, or `console`
                    both options may be configured and applicable. 
                        for example the DEV environment may be configured to log to both `stackdriver` and `console`   

_if a `statement`, `verbosity`, or `appender` option is excluded the corresponding Statement methods are annulled at startup (and after reconfiguration) to minimise the performance cost of 'not logging'_


### env._SHARED.STACKDRIVER configuration
```json
    env._SHARED.STACKDRIVER: {
        "logging": { "logName": "monitoring_prod", "resourceType": "gce_instance" },  
        "errors": { "reportMode": "always", "logLevel": 5 },                          
        "trace": {
            "samplingRate": 500, "enabled": true, "flushDelaySeconds": 1,             
            "ignoreUrls": [/^\/static/], "ignoreMethods": ["OPTIONS", "PUT"]        
        }
    }
```
__logging__     use 'generic_task' (not tested) for microservices. 
                cloud run resourceType is "cloud_run_revision", 
                for GCE VM Instance resourceType is ''gce_instance' 
                logName appears in logs as jsonPayload.logName: "projects/sundaya/logs/monitoring"
                the format is "projects/[PROJECT_ID]/logs/[LOG_ID]"
__errors__      'production' (default), 'always', or 'never' 
                'production' will not log unless NODE-ENV=production
                'logLevel' specifies when errors are reported to the Error Reporting Console. 
                    2 (warnings). 0 (no logs) 5 (all logs)      
__trace__       enabled=false to turn OFF tracing. 
                samplingRate 500 means sample 1 trace every half-second, 5 means at most 1 every 200 ms. 
                flushDelaySeconds = seconds to buffer traces before publishing to Stackdriver, keep short to allow cloud run to async trace immedatily after sync run             
                ignoreUrls is configured to ignore /static "path", 
                ignoreMethods is configured to ignore requests with OPTIONS & PUT methods (case-insensitive)                

### env.FEATURES configuration
```json
    env._FEATURES: {
        "release": [ enums.features.release ],
        "operational": [ enums.features.operational ],
        "experiment": [ enums.features.experiment ],
        "permission": [ enums.features.permission ]
    }
```
_toggles features on and off_
_the logging feature (`enums.features.operational.logging`) detrermines whether logging can be reconfigured at runtime_
_if the feature is present Logger can be reconfigured at runtime through the `api/logging` path and configuration changes are propogated through the message broker to other microservices_

__release__     the feature is made active for a particular release
                automatically deactivated when a new release is made
                if multiple releases are present in the environment (e.g. canary release) only the specified release(s) will provide the feature. 
__operational__ the feature is intended for operational use (not business logic)
__experiment__  the feature is experimental and may be restricted by time and scope
__permission__  the feature restricts access to certain users


## class hierarchy
_Logger associates with a Statement, which provides a supertype for each statement type_
_Logger provides helper methods for clients to invoke each statement type_

Logger  -> Statement -> MessagingStatement
                        DataStatement
                        ExceptionStatement
                        ErrorStatement
                        TraceStatement

## logging configuration
_enumerations for logging and error reporting configuration_

```json
    enums.logging: {
        "statements": {
            "data": "data",
            "error": "error",
            "exception": "exception",
            "messaging": "messaging",
            "trace": "trace"
        },
        "verbosity": {
            "none": "none",
            "info": "info",
            "debug": "debug"
        },
        "appenders": {   
            "console": "console",
            "stackdriver": "stackdriver"
        }
    }
```
__statements__  determines which log statements will produce log output 
__verbosity__   log levels for error reporting and logged events
__appenders__   output options for logging and error reporting   


## feature configuration

_flags for feature toogles_


```json
    enums.features = {
        "release": { "none": "none" },
        "operational": {
            "none": "none",
            "logging": "logging",                             
            "validation": "validation"                        
        },
        "experiment": { "none": "none" },
        "permission": { "none": "none" }
    }
```
__validation__  whether or not to to perform in-depth input validation for post requests
__logging__     logging reconfiguration feature
