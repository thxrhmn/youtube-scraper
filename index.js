const puppeteer = require("puppeteer");
const fs = require("fs");

const path = "./results/";
const baseURL = "https://youtube.com";

async function get_list_video(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  //   await scrollDownPage(page, 5, 1000);
  //   await scrollDownPage(page, 5, 3000);
  //   await scrollDownPage(page, 20, 3000);

  const videos = [];
  const videoHandlers = await page.$$(".style-scope.ytd-rich-grid-row");
  //   const videoHandlers = await page.$x(
  //     '//*[@id="contents"]/ytd-rich-item-renderer[1]'
  //   );

  for (let videoHandle of videoHandlers) {
    const titleElement = await videoHandle.$("#video-title");
    const linkElement = await videoHandle.$("#video-title-link");
    const viewElement = await videoHandle.$(
      "#metadata-line > span:nth-child(3)"
    );
    const publishedElement = await videoHandle.$(
      "#metadata-line > span:nth-child(4)"
    );

    const title = titleElement
      ? await titleElement.evaluate((el) => el.textContent, titleElement)
      : "-";
    const rawLink = linkElement
      ? await linkElement.evaluate((el) => el.getAttribute("href"), linkElement)
      : "-";
    const link = rawLink ? baseURL + rawLink : "-";
    const viewers = viewElement
      ? await viewElement.evaluate((el) => el.textContent, viewElement)
      : "-";
    const published = publishedElement
      ? await publishedElement.evaluate(
          (el) => el.textContent,
          publishedElement
        )
      : "-";
    const id = link ? link.split("v=")[1] : "-";

    const hd = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const medium = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const low = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

    const thumbnails = {
      hd,
      medium,
      low,
    };

    let item = {
      id,
      link,
      title,
      published,
      viewers,
      thumbnails,
    };

    // Mengecek apakah item sudah ada dalam array videos
    if (!videos.some((video) => video.id === item.id)) {
      videos.push(item);
    } else {
      console.log(
        `Item ${item.id} sudah ada dalam array videos, tidak akan ditambahkan lagi.`
      );
    }
  }

  await browser.close();

  return videos;
}

async function get_detail_video(arrayVideos) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const details = [];

  for (let i = 0; i < arrayVideos.length; i++) {
    await page.goto(arrayVideos[i].link);

    const titleElement = await page.$("#watch7-content > meta:nth-child(2)");
    const linkElement = await page.$("#watch7-content > link:nth-child(1)");
    const channelURLElement = await page.$(
      "#watch7-content > span:nth-child(7) > link:nth-child(1)"
    );
    const channelNameElement = await page.$(
      "#watch7-content > span:nth-child(7) > link:nth-child(2)"
    );
    const durationElement = await page.$("#watch7-content > meta:nth-child(6)");
    const datePublishedElement = await page.$(
      "#watch7-content > meta:nth-child(18)"
    );
    const uploadDateElement = await page.$(
      "#watch7-content > meta:nth-child(19)"
    );

    const title = titleElement
      ? await titleElement.evaluate((el) => el.getAttribute("content"))
      : "-";
    const link = linkElement
      ? await linkElement.evaluate((el) => el.getAttribute("href"))
      : "-";
    const channelURL = channelURLElement
      ? await channelURLElement.evaluate((el) => el.getAttribute("href"))
      : "-";
    const channelName = channelNameElement
      ? await channelNameElement.evaluate((el) => el.getAttribute("content"))
      : "-";
    const duration = durationElement
      ? convertDuration(
          await durationElement.evaluate((el) => el.getAttribute("content"))
        )
      : "-";
    const datePublished = datePublishedElement
      ? await datePublishedElement.evaluate((el) => el.getAttribute("content"))
      : "-";
    const uploadDate = uploadDateElement
      ? await uploadDateElement.evaluate((el) => el.getAttribute("content"))
      : "-";
    const id = link ? link.split("v=")[1] : "-";

    const hd = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const medium = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const low = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

    const item = {
      id: id,
      title: title,
      link: link,
      duration: duration,
      channel: {
        name: channelName,
        url: channelURL,
      },
      thumbnails: {
        hd,
        medium,
        low,
      },
      datePublished,
      uploadDate,
    };

    console.log(i, " ", item);
    details.push(item);
  }
  await browser.close();
  return details;
}

async function get_playlist(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const videos = [];

  const id = url ? new URL(url).searchParams.get("list") : "-";
  const titlePlaylistElement = await page.$("#text");
  const channelNamePlaylistElement = await page.$("#owner-text > a");
  const channelPlaylistTotalVideosElement = await page.$(
    "yt-formatted-string:nth-child(2) > span:nth-child(1)"
  );
  const channelPlaylistViewersElement = await page.$(
    "ytd-playlist-byline-renderer > div > yt-formatted-string:nth-child(4)"
  );
  const channelPlaylistLastUpdatedElement = await page.$(
    "ytd-playlist-byline-renderer > div > yt-formatted-string:nth-child(6) > span:nth-child(2)"
  );

  const title = titlePlaylistElement
    ? await titlePlaylistElement.evaluate(
        (el) => el.textContent,
        titlePlaylistElement
      )
    : "-";
  const channelPlaylistName = channelNamePlaylistElement
    ? await channelNamePlaylistElement.evaluate(
        (el) => el.textContent,
        channelNamePlaylistElement
      )
    : "-";
  const channelPlaylistLink = channelNamePlaylistElement
    ? await channelNamePlaylistElement.evaluate(
        (el) => el.getAttribute("href"),
        channelNamePlaylistElement
      )
    : "-";
  const channelPlaylistTotalVideos = channelPlaylistTotalVideosElement
    ? await channelPlaylistTotalVideosElement.evaluate(
        (el) => el.textContent,
        channelPlaylistTotalVideosElement
      )
    : "-";
  const channelPlaylistViewers = channelPlaylistViewersElement
    ? await channelPlaylistViewersElement.evaluate(
        (el) => el.textContent,
        channelPlaylistViewersElement
      )
    : "-";
  const channelPlaylistLastUpdated = channelPlaylistLastUpdatedElement
    ? await channelPlaylistLastUpdatedElement.evaluate(
        (el) => el.textContent,
        channelPlaylistLastUpdatedElement
      )
    : "-";

  const raw = await page.$("#content");
  const channelPlaylistVideosHandler = await raw.$$(
    ".style-scope.ytd-playlist-video-list-renderer"
  );

  for (let channelPlaylistVideo of channelPlaylistVideosHandler) {
    const titleElement = await channelPlaylistVideo.$("#video-title");
    const linkElement = await channelPlaylistVideo.$("#video-title");
    const publishedElement = await channelPlaylistVideo.$(
      "#video-info > span:nth-child(3)"
    );
    const viewersElement = await channelPlaylistVideo.$(
      "#video-info > span:nth-child(1)"
    );
    const durationElement = await channelPlaylistVideo.$("#text");

    const title = titleElement
      ? await titleElement.evaluate((el) => el.textContent.trim(), titleElement)
      : "-";
    const link = linkElement
      ? await linkElement.evaluate((el) => el.getAttribute("href"), linkElement)
      : "-";
    const published = publishedElement
      ? await publishedElement.evaluate(
          (el) => el.textContent.trim(),
          publishedElement
        )
      : "-";
    const viewers = viewersElement
      ? await viewersElement.evaluate(
          (el) => el.textContent.trim(),
          viewersElement
        )
      : "-";
    const duration = durationElement
      ? await durationElement.evaluate(
          (el) => el.textContent.trim(),
          durationElement
        )
      : "-";

    const li = link ? baseURL + link : "-";
    const id = li ? new URL(li).searchParams.get("v") : "-";

    const hd = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const medium = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const low = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

    const thumbnails = {
      hd,
      medium,
      low,
    };

    const video = {
      id,
      title,
      link: baseURL + link,
      viewers,
      duration,
      published,
      thumbnails,
    };

    if (video.id !== "-" && video.id !== undefined) {
      if (video.id !== null) {
        if (!videos.some((v) => v.id === video.id)) {
          videos.push(video);
          // console.log(video);
        }
      }
    }
  }

  const item = {
    id,
    title,
    channelName: channelPlaylistName,
    channelURL: baseURL + channelPlaylistLink,
    channelTotalVideos: channelPlaylistTotalVideos,
    viewers: channelPlaylistViewers,
    lastUpdated: channelPlaylistLastUpdated,
    totalVideos: videos.length,
    videos,
  };

  await browser.close();
  return item;
}

function convertDuration(duration_str) {
  // Gunakan regular expression untuk mengurai durasi
  const match = duration_str.match(/PT(\d+)M(\d+)S/);
  if (match) {
    const [_, minutes, seconds] = match;
    // Ubah ke format yang diinginkan
    const formatted_duration = `${minutes}:${seconds.padStart(2, "0")}`; // Menambahkan 0 di depan jika detik < 10
    return formatted_duration;
  } else {
    return duration_str; // Jika format tidak sesuai, kembalikan string asli
  }
}

function countTimes(startTime) {
  // Catat waktu selesai
  const endTime = new Date();

  // Hitung durasi eksekusi dalam milidetik
  const executionTime = endTime - startTime;

  // Hitung menit dan detik
  const minutes = Math.floor(executionTime / 60000); // 1 menit = 60000 milidetik
  const seconds = ((executionTime % 60000) / 1000).toFixed(2);
  console.log("\n");
  console.log(`Waktu eksekusi: ${minutes} menit ${seconds} detik`);
}

function saveToJsonFile(youtubeURL, data) {
  const jsonData = JSON.stringify(data, null, 2);

  // Buat objek Date untuk mendapatkan tanggal saat ini
  const currentDate = new Date();

  // Dapatkan tahun, bulan, tanggal, jam, dan menit dari tanggal
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Tambahkan 1 karena bulan dimulai dari 0
  const day = currentDate.getDate().toString().padStart(2, "0");
  const hour = currentDate.getHours().toString().padStart(2, "0");
  const minute = currentDate.getMinutes().toString().padStart(2, "0");

  // Buat nama berkas dengan format: "YYYY_MM_DD_HH_MM.json"
  const filename = `${path}playlist_${youtubeURL}_${year}_${month}_${day}_${hour}_${minute}.json`;

  fs.writeFile(filename, jsonData, (err) => {
    if (err) {
      console.error("Gagal menyimpan berkas JSON:", err);
    } else {
      console.log("Berkas JSON berhasil disimpan dengan nama:", filename);
    }
  });
}

async function scrollDownPage(page, numScrolls, scrollAmount) {
  for (let i = 0; i < numScrolls; i++) {
    // Scroll down by a certain amount
    await page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, scrollAmount);

    // Add a delay to allow the content to load (you can adjust this as needed)
    await page.waitForTimeout(2000); // Waktu tidur selama 2 detik (2000 milidetik)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  // Catat waktu mulai eksekusi
  const startTime = new Date();

  const url = "https://www.youtube.com/@JohnWatsonRooney/videos";

  const videos = await get_list_video(url);
  console.log("total videos: ", videos.length);

  const details = await get_detail_video(videos);
  saveToJsonFile("JohnWatsonRoone", details);

  //   const playlist = await get_playlist(
  //     "https://www.youtube.com/playlist?list=PLRzwgpycm-Fio7EyivRKOBN4D3tfQ_rpu"
  //   );

  //   const channelName = playlist ? playlist.channelURL.split("@")[1] : "-";

  //   saveToJsonFile(channelName, playlist);

  //   console.log("total videos: ", playlist.videos.length);
  //   console.log(playlist);

  // Catat waktu akhir eksekusi
  countTimes(startTime);
  //   console.log("Berhasil menyimpan ", videos.length, " video");
})();
