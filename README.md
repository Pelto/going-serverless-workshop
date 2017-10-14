# Going Serverless - workshop
A workshop on how to construct serverless applications on AWS. 


## Getting started

It is possible to execute the application on localhost by executing the script located at

```
./scripts/run-localhost.sh --stack-name <your_stack_name>
```


## 1. Deploy the backend

```
./scripts/deploy-stack.sh --stack-name <stack-name>
```

Take note of the URL that the script returns. This will be needed in next step.


## 2. Deploy the web app

Deploy the stack by `scripts/deploy-web.sh --stack-name <stack-name>`
