FROM node
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3003
CMD npm run start 