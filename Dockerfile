FROM node
COPY . /root/typing-word
WORKDIR /root/typing-word
EXPOSE 3000
RUN npm install
CMD ["npm", "start"]