docker run -p 8081:8081 \
-e DOJO_URL=http://localhost:8081 \
-e DATA_DIR=/dojofiles \
-e ENC_KEY=$ENC_KEY \
-e ENC_KEY_IV=$ENC_KEY_IV \
-e CHALLENGE_MASTER_SALT=$CHALLENGE_MASTER_SALT \
--volume=/$DATA_DIR:/dojofiles:consistent \
securecodingdojo/trainingportal