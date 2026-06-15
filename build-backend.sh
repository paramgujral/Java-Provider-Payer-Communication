#!/bin/bash
cd "C:\Users\USER\Desktop\Git\Java-Provider-Payer-Communication_Dhananjay\Healthcare_Insurance_Management_System"
if [ -d target ]; then rm -rf target; fi
.\mvnw.cmd clean package -DskipTests 2>&1 | tail -50
